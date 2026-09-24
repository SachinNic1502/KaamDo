const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const { NextRequest } = require("next/server");

// Execute the actual handlers/schemas with isolated persistence/auth boundaries.
// No network, database, provider credentials or new test dependency is needed.
const root = path.resolve(__dirname, "..");
function loader(mocks) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const nativeRequire = createRequire(file);
    function requireSource(specifier) {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return nativeRequire(specifier);
      const base = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : path.resolve(path.dirname(file), specifier);
      const resolved = [base + ".ts", base + ".tsx", path.join(base, "index.ts")]
        .find((candidate) => fs.existsSync(candidate));
      assert.ok(resolved, `Cannot resolve ${specifier} from ${file}`);
      return load(resolved);
    }
    const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: file,
    }).outputText;
    new Function("require", "module", "exports", compiled)(requireSource, module, module.exports);
    return module.exports;
  }
  return load;
}

const A = "a".repeat(24);
const B = "b".repeat(24);
const C = "c".repeat(24);
const actor = (role = "customer") => ({ userId: A, role, phone: "1234567890" });
function request(route, method = "GET", body, query = "") {
  return new NextRequest(`http://localhost/api/${route}${query}`, {
    method, headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
function query(result, capture = {}) {
  const q = {};
  for (const method of ["select", "populate", "sort", "skip", "limit"]) {
    q[method] = (...args) => { capture[method] = args; return q; };
  }
  q.lean = async () => result;
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
}
function setup(user, modelOverrides = {}) {
  let load;
  const mocks = {
    "@/lib/db": { connectDB: async () => {} },
    "@/lib/models": new Proxy(modelOverrides, {
      get(target, key) {
        assert.ok(Object.hasOwn(target, key), `Unexpected model access: ${String(key)}`);
        return target[key];
      },
    }),
    "@/lib/auth": { generateJobNumber: () => "JOB-test", generateOTP: () => "1234" },
    "@/lib/auth-middleware": {
      getAuthUser: async () => user,
      requireAuth: async () => {
        if (!user) throw new (load("src/lib/api-error.ts").ApiError)(401, "Unauthorized", "UNAUTHORIZED");
        return user;
      },
      requireRole: async (_request, roles) => {
        const principal = await mocks["@/lib/auth-middleware"].requireAuth();
        if (!roles.includes(principal.role)) throw new (load("src/lib/api-error.ts").ApiError)(403, "Forbidden", "FORBIDDEN");
        return principal;
      },
    },
  };
  load = loader(mocks);
  return { load, route: (name) => load(`src/app/api/${name}/route.ts`) };
}

for (const body of [{ jobId: B, paymentMethod: "cash" }, { action: "create-order", jobId: B }, { action: "verify", jobId: B, razorpay_signature: "forged" }]) {
  test(`payment write ${body.action || "legacy"} fails closed without any persistence`, async () => {
    const response = await setup(actor()).route("payments").POST(request("payments", "POST", body));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "PAYMENTS_DISABLED");
  });
}
test("payment write requires authentication and permitted role", async () => {
  assert.equal((await setup(null).route("payments").POST(request("payments", "POST", {}))).status, 401);
  assert.equal((await setup(actor("worker")).route("payments").POST(request("payments", "POST", {}))).status, 403);
});

for (const role of ["customer", "worker", "contractor"]) {
  test(`${role} cannot enumerate users or grant themselves admin`, async () => {
    const api = setup(actor(role)).route("users");
    assert.equal((await api.GET(request("users"))).status, 403);
    assert.equal((await api.PATCH(request("users", "PATCH", { userId: A, role: "admin" }))).status, 400);
  });
}
test("user edits deny other owners, password fields and Mongo operators before DB writes", async () => {
  const api = setup(actor()).route("users");
  for (const [body, status] of [
    [{ userId: B, name: "Other User" }, 403],
    [{ userId: A, password: "not-a-real-password" }, 400],
    [{ userId: A, $set: { role: "admin" } }, 400],
  ]) assert.equal((await api.PATCH(request("users", "PATCH", body))).status, status);
});
test("allowed self-profile update uses validated $set and a safe projection", async () => {
  const capture = {};
  const api = setup(actor(), { User: { findByIdAndUpdate(id, update, options) {
    assert.equal(id, A);
    assert.deepEqual(update, { $set: { name: "New Name" } });
    assert.equal(options.runValidators, true);
    return query({ _id: A, name: "New Name" }, capture);
  } } }).route("users");
  const response = await api.PATCH(request("users", "PATCH", { userId: A, name: "New Name" }));
  assert.equal(response.status, 200);
  assert.ok(!capture.select[0].includes("password"));
});

for (const body of [{ status: "verified" }, { totalEarnings: 100000 }, { userId: B }, { rating: 5 }, { $set: { status: "verified" } }]) {
  test(`worker cannot self-assign protected field ${Object.keys(body)[0]}`, async () => {
    const response = await setup(actor("worker")).route("workers").PATCH(request("workers", "PATCH", body));
    assert.equal(response.status, 400);
  });
}
test("worker self-edit preserves availability but cannot target another worker", async () => {
  const api = setup(actor("worker"), { WorkerProfile: { findOneAndUpdate(filter, update, options) {
    assert.deepEqual(filter, { userId: A });
    assert.deepEqual(update, { $set: { isOnline: true } });
    assert.equal(options.runValidators, true);
    return query({ _id: B, isOnline: true });
  } } }).route("workers");
  assert.equal((await api.PATCH(request("workers", "PATCH", { workerId: B, isOnline: true }))).status, 403);
  assert.equal((await api.PATCH(request("workers", "PATCH", { workerId: A, isOnline: true }))).status, 200);
});
test("admin can review a worker without arbitrary aggregate/ownership updates", async () => {
  const api = setup(actor("admin"), { WorkerProfile: { findOneAndUpdate(filter, update) {
    assert.deepEqual(filter, { userId: B });
    assert.deepEqual(update, { $set: { status: "verified" } });
    return query({ _id: C, status: "verified" });
  } } }).route("workers");
  assert.equal((await api.PATCH(request("workers", "PATCH", { workerId: B, status: "verified" }))).status, 200);
  assert.equal((await api.PATCH(request("workers", "PATCH", { workerId: B, totalEarnings: 1 }))).status, 400);
});
test("anonymous discovery restricts active workers and explicitly selects safe public fields", async () => {
  const capture = {};
  const api = setup(null, {
    User: { find(filter) {
      assert.equal(filter.isActive, true);
      assert.equal(filter.role, "worker");
      assert.equal(filter.$or.length, 1); // no private phone search
      assert.equal(filter.$or[0].name.$regex, "a\\.\\*");
      return { distinct: async () => [B] };
    } },
    WorkerProfile: {
      countDocuments: async (filter) => { assert.equal(filter.status, "verified"); return 0; },
      find(filter) { assert.deepEqual(filter.userId, { $in: [B] }); return query([], capture); },
    },
  }).route("workers");
  assert.equal((await api.GET(request("workers", "GET", undefined, "?search=a.*"))).status, 200);
  for (const secret of ["bankDetails", "documents", "totalEarnings"]) assert.ok(!capture.select[0].split(" ").includes(secret));
  assert.equal(capture.populate[1], "name avatar");
});
test("invalid worker price range is rejected", async () => {
  const response = await setup(null).route("workers").GET(request("workers", "GET", undefined, "?minPrice=50&maxPrice=10"));
  assert.equal(response.status, 400);
});

test("job mutations scope by owner and do not disclose missing versus foreign records", async () => {
  const api = setup(actor(), { Job: { findOne: async (filter) => {
    assert.deepEqual(filter, { _id: B, customerId: A });
    return null;
  } } }).route("jobs");
  assert.equal((await api.PATCH(request("jobs", "PATCH", { jobId: B, status: "cancelled" }))).status, 404);
});
test("job list omits verification codes and scopes workers directly", async () => {
  const capture = {};
  const api = setup(actor("worker"), { Job: {
    countDocuments: async () => 0,
    find(filter) { assert.equal(filter.workerId, A); return query([], capture); },
  } }).route("jobs");
  assert.equal((await api.GET(request("jobs"))).status, 200);
  assert.equal(capture.select[0], "-startOtp -completionOtp");
});
test("undefined completion codes cannot complete a job", async () => {
  const api = setup(actor(), { Job: { findOne: async () => ({ status: "completion_requested", completionOtp: undefined }) } }).route("jobs");
  assert.equal((await api.PATCH(request("jobs", "PATCH", { jobId: B, status: "completed" }))).status, 400);
});
test("worker cannot preapprove charges or supply a forged material total", async () => {
  const api = setup(actor("worker")).route("jobs");
  for (const update of [
    { additionalCharge: { description: "Extra work", amount: 10, status: "approved" } },
    { materials: [{ name: "Cable", quantity: 2, unitPrice: 10, totalPrice: 10000 }] },
  ]) assert.equal((await api.PATCH(request("jobs", "PATCH", { jobId: B, ...update }))).status, 400);
});
test("allowed job update computes material totals and hides both OTPs", async () => {
  let saved = false;
  const job = {
    status: "in_progress", startOtp: "1234", completionOtp: "5678", materials: [],
    save: async () => { saved = true; },
    toObject() { return { status: this.status, materials: this.materials, startOtp: this.startOtp, completionOtp: this.completionOtp }; },
  };
  const api = setup(actor("worker"), { Job: { findOne: async () => job } }).route("jobs");
  const response = await api.PATCH(request("jobs", "PATCH", { jobId: B, materials: [{ name: "Cable", quantity: 2, unitPrice: 10 }] }));
  assert.equal(response.status, 200);
  assert.equal(saved, true);
  const body = await response.json();
  assert.equal(body.data.materials[0].totalPrice, 20);
  assert.equal(body.data.startOtp, undefined);
  assert.equal(body.data.completionOtp, undefined);
});
test("non-admin cannot assign a job even when they own it", async () => {
  const api = setup(actor(), { Job: { findOne: async () => ({}) } }).route("jobs");
  assert.equal((await api.PATCH(request("jobs", "PATCH", { jobId: B, workerId: C }))).status, 403);
});
test("foreign project mutation uses participant scope", async () => {
  const api = setup(actor("contractor"), { Project: { findOne: async (filter) => {
    assert.deepEqual(filter, { _id: B, contractorId: A }); return null;
  } } }).route("projects");
  assert.equal((await api.PATCH(request("projects", "PATCH", { projectId: B, title: "Changed" }))).status, 404);
});
test("project owners cannot edit money/ownership or mark milestones paid", async () => {
  const api = setup(actor(), { Project: { findOne: async () => ({}) } }).route("projects");
  assert.equal((await api.PATCH(request("projects", "PATCH", { projectId: B, customerId: C }))).status, 400);
  assert.equal((await api.PATCH(request("projects", "PATCH", { projectId: B, totalAmount: 1 }))).status, 400);
  assert.equal((await api.PATCH(request("projects", "PATCH", { projectId: B, milestoneIndex: 0, milestoneStatus: "paid" }))).status, 503);
});
test("attendance approval is denied to every non-admin role", async () => {
  for (const role of ["customer", "worker", "contractor"]) {
    const response = await setup(actor(role)).route("attendance").PATCH(request("attendance", "PATCH", { attendanceId: B, status: "approved", approvedWage: 100 }));
    assert.equal(response.status, 403);
  }
});
test("worker cannot submit another worker's attendance", async () => {
  const response = await setup(actor("worker")).route("attendance").POST(request("attendance", "POST", {
    jobId: C, workerId: B, date: "2026-09-21T00:00:00.000Z", status: "present",
  }));
  assert.equal(response.status, 403);
});
test("even admin approval rejects a negative wage before reading the record", async () => {
  const api = setup(actor("admin")).route("attendance");
  assert.equal((await api.PATCH(request("attendance", "PATCH", { attendanceId: B, approvedWage: -100 }))).status, 400);
});
test("dispute cannot target another customer's job", async () => {
  const api = setup(actor(), {
    User: { findOne: async () => ({ _id: A }) },
    Job: { findOne: async (filter) => { assert.deepEqual(filter, { _id: B, customerId: A }); return null; } },
  }).route("disputes");
  assert.equal((await api.POST(request("disputes", "POST", { jobId: B, reason: "Missing work", description: "Work has not been completed correctly." }))).status, 404);
});
test("payment method deletion is owner scoped on lookup AND delete", async () => {
  let deleted = false;
  const api = setup(actor(), { PaymentMethod: {
    findOne: async (filter) => { assert.deepEqual(filter, { _id: B, userId: A }); return { isDefault: false }; },
    findOneAndDelete: async (filter) => { assert.deepEqual(filter, { _id: B, userId: A }); deleted = true; },
  } }).route("payment-methods");
  assert.equal((await api.DELETE(request("payment-methods", "DELETE", undefined, `?methodId=${B}`))).status, 200);
  assert.equal(deleted, true);
});
test("foreign payment method returns 404 without deletion", async () => {
  const api = setup(actor(), { PaymentMethod: { findOne: async () => null } }).route("payment-methods");
  assert.equal((await api.DELETE(request("payment-methods", "DELETE", undefined, `?methodId=${B}`))).status, 404);
});

test("resource scopes reject roles without ownership semantics", () => {
  const { load } = setup(null);
  const { resourceScope } = load("src/lib/resource-policy.ts");
  assert.throws(() => resourceScope(actor("contractor"), "jobs"), { status: 403 });
  assert.throws(() => resourceScope(actor("worker"), "projects"), { status: 403 });
  assert.throws(() => resourceScope(actor("unknown"), "attendance"), { status: 403 });
});

for (const [name, account, issuedAt, expected] of [
  ["active", { _id: A, role: "customer", phone: "current", isActive: true }, 100, true],
  ["deleted", null, 100, false],
  ["disabled", { _id: A, role: "customer", isActive: false }, 100, false],
  ["changed role", { _id: A, role: "admin", isActive: true }, 100, false],
  ["password changed", { _id: A, role: "customer", isActive: true, passwordChangedAt: new Date(101000) }, 100, false],
]) {
  test(`authentication rechecks ${name} account`, async () => {
    const load = loader({
      "./auth": { verifyJWT: async () => ({ ...actor(), iat: issuedAt }) },
      "./db": { connectDB: async () => {} },
      "./models/user.model": { default: { findById: () => query(account) }, __esModule: true },
    });
    const req = request("users");
    req.headers.set("authorization", "Bearer test-token");
    const result = await load("src/lib/auth-middleware.ts").getAuthUser(req);
    assert.equal(Boolean(result), expected);
    if (result) assert.equal(result.phone, "current");
  });
}

test("logout session version invalidates old tokens", async () => {
  const load = loader({
    "./auth": { verifyJWT: async () => ({ ...actor(), sessionVersion: 0 }) },
    "./db": { connectDB: async () => {} },
    "./models/user.model": { default: { findById: () => query({ _id: A, role: "customer", isActive: true, sessionVersion: 1 }) }, __esModule: true },
  });
  assert.equal(await load("src/lib/auth-middleware.ts").authenticateToken("old"), null);
});

test("job lifecycle enforces role and sequence", () => {
  const { assertJobTransition: transition } = loader({})("src/lib/job-lifecycle.ts");
  for (const [from, to] of [["worker_assigned", "worker_accepted"], ["worker_accepted", "on_the_way"], ["on_the_way", "arrived"], ["arrived", "work_started"], ["work_started", "completion_requested"]]) transition(from, to, "worker");
  transition("completion_requested", "completed", "customer");
  for (const [from, to, role] of [["worker_assigned", "completed", "customer"], ["completion_requested", "completed", "worker"], ["paid", "cancelled", "customer"], ["arrived", "work_started", "admin"]]) assert.throws(() => transition(from, to, role), { code: "INVALID_JOB_STATE" });
});

test("customer detail gets its codes but foreign detail remains inaccessible", async () => {
  const api = setup(actor(), { Job: { findOne(filter) {
    assert.deepEqual(filter, { _id: B, customerId: A });
    return query(null);
  } } }).route("jobs");
  assert.equal((await api.GET(request("jobs", "GET", undefined, `?jobId=${B}`))).status, 404);
});

test("openWA never treats failed provider response as delivered", async t => {
  t.mock.method(global, "fetch", async () => ({ ok: true, json: async () => ({ success: true, data: false }) }));
  const oldUrl = process.env.OPENWA_SEND_TEXT_URL, oldKey = process.env.OPENWA_API_KEY;
  process.env.OPENWA_SEND_TEXT_URL = "http://127.0.0.1/sendText"; process.env.OPENWA_API_KEY = "test";
  try { await assert.rejects(loader({})("src/lib/services/otp-delivery.ts").deliverOtp("9876543210", "1234"), { code: "OTP_DELIVERY_UNAVAILABLE" }); }
  finally { if (oldUrl === undefined) delete process.env.OPENWA_SEND_TEXT_URL; else process.env.OPENWA_SEND_TEXT_URL = oldUrl; if (oldKey === undefined) delete process.env.OPENWA_API_KEY; else process.env.OPENWA_API_KEY = oldKey; }
});

test("phone formats share one OTP identity", () => {
  const { phoneSchema } = loader({})("src/lib/validations.ts");
  assert.equal(phoneSchema.parse({ phone: "+919876543210" }).phone, "9876543210");
  assert.equal(phoneSchema.parse({ phone: "919876543210" }).phone, "9876543210");
});

for (const [name, payment, accepted] of [
  ["captured", { id: "pay_1", order_id: "order_1", status: "captured", amount: 10000, currency: "INR", amount_refunded: 0 }, true],
  ["wrong order", { id: "pay_1", order_id: "other", status: "captured", amount: 10000, currency: "INR" }, false],
  ["wrong amount", { id: "pay_1", order_id: "order_1", status: "captured", amount: 1, currency: "INR" }, false],
  ["authorized only", { id: "pay_1", order_id: "order_1", status: "authorized", amount: 10000, currency: "INR" }, false],
  ["refunded", { id: "pay_1", order_id: "order_1", status: "captured", amount: 10000, currency: "INR", amount_refunded: 100 }, false],
]) test(`Razorpay ${name} verification`, async t => {
  const oldId = process.env.RAZORPAY_KEY_ID, oldSecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_ID = "test_id"; process.env.RAZORPAY_KEY_SECRET = "test_secret";
  t.mock.method(global, "fetch", async () => ({ ok: true, json: async () => payment }));
  try {
    const signature = require("node:crypto").createHmac("sha256", "test_secret").update("order_1|pay_1").digest("hex");
    const verify = loader({})("src/lib/services/payment-providers.ts").verifyProviderPayment;
    if (accepted) assert.equal(await verify("razorpay", "order_1", 10000, "pay_1", signature), "pay_1");
    else await assert.rejects(verify("razorpay", "order_1", 10000, "pay_1", signature), { code: "PAYMENT_PENDING" });
    await assert.rejects(verify("razorpay", "order_1", 10000, "pay_1", "forged"), { code: "INVALID_PAYMENT_PROOF" });
  } finally { if (oldId === undefined) delete process.env.RAZORPAY_KEY_ID; else process.env.RAZORPAY_KEY_ID = oldId; if (oldSecret === undefined) delete process.env.RAZORPAY_KEY_SECRET; else process.env.RAZORPAY_KEY_SECRET = oldSecret; }
});

test("Cashfree accepts only matching successful payment", async t => {
  const env = { CASHFREE_CLIENT_ID: process.env.CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET: process.env.CASHFREE_CLIENT_SECRET };
  process.env.CASHFREE_CLIENT_ID = "test"; process.env.CASHFREE_CLIENT_SECRET = "test";
  let status = "PENDING";
  t.mock.method(global, "fetch", async (url) => ({ ok: true, json: async () => url.endsWith("/refunds") ? [] : [{ order_id: "order_1", payment_status: status, payment_amount: 100, payment_currency: "INR", cf_payment_id: 123 }] }));
  try {
    const verify = loader({})("src/lib/services/payment-providers.ts").verifyProviderPayment;
    await assert.rejects(verify("cashfree", "order_1", 10000), { code: "PAYMENT_PENDING" });
    status = "SUCCESS"; assert.equal(await verify("cashfree", "order_1", 10000), "123");
    await assert.rejects(verify("cashfree", "order_1", 9999), { code: "PAYMENT_PENDING" });
  } finally { for (const [key, value] of Object.entries(env)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
});

function socketFixture() {
  let io, current = actor(), participating = true;
  class FakeIO {
    sockets = { sockets: new Map() };
    constructor() { io = this; }
    use(fn) { this.middleware = fn; }
    on(event, fn) { this.connection = fn; }
  }
  const load = loader({
    "socket.io": { Server: FakeIO },
    "../auth-session": { authenticateToken: async () => current },
    "../models/job.model": { __esModule: true, default: { findOne: () => query(participating ? { customerId: A, workerId: B } : null) } },
  });
  const server = new (load("src/lib/socket/server.ts").SocketServer)({});
  const socket = { id: "socket-1", handshake: { auth: { token: "test" }, headers: {} }, data: {}, handlers: {}, events: [], rooms: new Set(), on(event, fn) { this.handlers[event] = fn; }, emit(event, data) { this.events.push({ event, data }); }, join(room) { this.rooms.add(room); }, leave(room) { this.rooms.delete(room); }, disconnect() { this.disconnected = true; } };
  const tick = () => new Promise(resolve => setImmediate(resolve));
  return { socket, server, setCurrent: value => current = value, setParticipation: value => participating = value,
    async connect() { let error; await io.middleware(socket, e => error = e); if (error) return error; io.sockets.sockets.set(socket.id, socket); io.connection(socket); },
    async event(name, data) { socket.handlers[name](data); await tick(); },
  };
}
test("socket denies foreign room and message", async () => {
  const f = socketFixture(); await f.connect(); f.setParticipation(false);
  await f.event("join-job", { jobId: C }); assert.equal(f.socket.rooms.size, 0);
  await f.event("send-message", { jobId: C, text: "unauthorized" });
  assert.equal(f.socket.events.filter(e => e.event === "new-message").length, 0);
});
test("socket rechecks revoked account before delivering to an existing subscriber", async () => {
  const f = socketFixture(); await f.connect(); await f.event("join-job", { jobId: C });
  assert.ok(f.socket.rooms.has(`job:${C}`));
  f.setCurrent(null); await f.server.broadcastJobUpdate(C, { status: "completed" });
  assert.equal(f.socket.events.filter(e => e.event === "job-status-update").length, 0);
  assert.equal(f.socket.disconnected, true);
});
test("socket derives sender and receiver from account and job", async () => {
  const f = socketFixture(); await f.connect(); await f.event("join-job", { jobId: C });
  await f.event("send-message", { jobId: C, text: "hello", senderId: C, receiverId: C });
  const message = f.socket.events.find(e => e.event === "new-message").data;
  assert.equal(message.senderId, A); assert.equal(message.receiverId, B);
});

test("OTP registration ignores requested privileges and creates no temporary password", async () => {
  let inserted;
  const account = { _id: A, name: "Customer", phone: "9876543210", role: "customer", isActive: true, isPhoneVerified: true, sessionVersion: 0 };
  const load = loader({
    "@/lib/db": { connectDB: async () => {} },
    "@/lib/models": { User: { findOne: async () => null, findOneAndUpdate: async (_filter, update) => { inserted = update.$setOnInsert; return account; } } },
    "@/lib/auth": { signJWT: async () => "signed", generateOTP: () => "1234" },
    "@/lib/auth-middleware": {},
    "@/lib/middleware/rate-limit": { authRateLimit: async () => null },
    "@/lib/services/redis-client": { OtpStorage: { verifyOtp: async () => true } },
    "@/lib/services/otp-delivery": {},
  });
  const result = await load("src/app/api/auth/route.ts").POST(request("auth", "POST", { action: "verify-otp", phone: "9876543210", otp: "1234", role: "admin", password: "injected" }));
  assert.equal(result.status, 200); assert.equal(inserted.role, "customer"); assert.equal(inserted.password, undefined);
  assert.equal((await result.json()).data.user._id, A);
});

test("OTP send failure removes challenge and never reports success", async () => {
  let removed = false;
  const load = loader({
    "@/lib/db": { connectDB: async () => {} }, "@/lib/models": {}, "@/lib/auth-middleware": {},
    "@/lib/auth": { generateOTP: () => "1234" },
    "@/lib/middleware/rate-limit": { authRateLimit: async () => null },
    "@/lib/services/redis-client": { OtpStorage: { reserveSend: async () => {}, storeOtp: async () => {}, deleteOtp: async () => { removed = true; } } },
    "@/lib/services/otp-delivery": { deliverOtp: async () => { throw new Error("offline"); } },
  });
  const response = await load("src/app/api/auth/route.ts").POST(request("auth", "POST", { action: "send-otp", phone: "9876543210" }));
  assert.ok(response.status >= 500); assert.equal(removed, true); assert.equal((await response.json()).success, false);
});

test("duplicate payment confirmation does not repeat payment or payout writes", async () => {
  const order = { _id: C, jobId: B, customerId: A, workerId: C, gateway: "cashfree", orderId: "order", status: "pending", amountMinor: 10000, feeMinor: 1000 };
  let payments = 0, obligations = 0, transactions = 0, verifications = 0;
  const load = loader({
    mongoose: { __esModule: true, default: { connection: { transaction: async fn => { transactions++; return fn({}); } } } },
    "../db": { connectDB: async () => {} },
    "../models/payment-order.model": { __esModule: true, default: { findOne: async () => order, findOneAndUpdate: async () => { order.status = "completed"; return order; } } },
    "../models/payout-obligation.model": { __esModule: true, default: { create: async () => { obligations++; } } },
    "../models": { Job: { findOneAndUpdate: async () => ({ _id: B }) }, Payment: { create: async ([payment]) => { payments++; assert.equal(payment.amount, 100); assert.equal(payment.workerEarning, 90); return [{ _id: C }]; } } },
    "./payment-providers": { verifyProviderPayment: async () => { verifications++; return "payment"; } },
  });
  const { confirmCheckout } = load("src/lib/services/checkout.ts");
  assert.equal((await confirmCheckout(A, B)).status, "completed");
  assert.equal((await confirmCheckout(A, B)).status, "completed");
  assert.deepEqual([payments, obligations, transactions, verifications], [1, 1, 1, 1]);
});

for (const role of ["customer", "worker", "contractor"]) test(`${role} cannot reconcile a manual payout`, async () => {
  assert.equal((await setup(actor(role)).route("payouts").POST(request("payouts", "POST", {}))).status, 403);
});

test("manual payout rejects amount mismatch before provider or bank records change", async () => {
  const load = loader({
    "@/lib/auth-middleware": { requireRole: async () => actor("admin") },
    "@/lib/db": { connectDB: async () => {} },
    "@/lib/models/payout-obligation.model": { __esModule: true, default: { createIndexes: async () => {}, findById: async () => ({ status: "awaiting_settlement", amountMinor: 9000 }) } },
    "@/lib/models/payment.model": {}, "@/lib/models/payment-order.model": {},
    "@/lib/services/payment-providers": { reconcileProviderPayment: async () => assert.fail("Must not contact provider for mismatched amount") },
  });
  const result = await load("src/app/api/payouts/route.ts").POST(request("payouts", "POST", { obligationId: B, amountMinor: 1, bankReference: "BANK123456", transferredAt: "2026-01-01T00:00:00.000Z", statementReference: "statement-123", transferVerified: true }));
  assert.equal(result.status, 400); assert.equal((await result.json()).code, "AMOUNT_MISMATCH");
});

test("booking handlers support create, assigned worker start and customer completion", async () => {
  let stored;
  const Job = {
    create: async data => { stored = { ...data, _id: C, additionalCharges: [], materials: [], async save() {}, toObject() { return { ...this }; } }; return stored; },
    findOne: async filter => {
      if (filter.customerId && String(stored.customerId) !== filter.customerId) return null;
      if (filter.workerId && String(stored.workerId) !== filter.workerId) return null;
      return stored;
    },
  };
  const customer = actor();
  const worker = { ...actor("worker"), userId: B };
  const create = setup(customer, { Job, User: { findById: async () => ({ _id: A }) }, ServiceCategory: { findById: async () => ({ name: "Plumbing", isActive: true, subcategories: [{ _id: B, isActive: true, pricingModel: "fixed", basePrice: 100 }] }) }, WorkerProfile: { find: () => query([{ userId: { _id: B } }]) } }).route("jobs");
  const response = await create.POST(request("jobs", "POST", { categoryId: C, subcategoryId: B, description: "Please repair my tap", address: { label: "Home", address: "123 Test Road", city: "Mumbai", state: "Maharashtra", pincode: "400001" }, scheduledDate: new Date(Date.now() + 86400000).toISOString(), pricingModel: "fixed", estimatedPrice: 1 }));
  assert.equal(response.status, 201); assert.equal(stored.status, "worker_assigned"); assert.equal(stored.estimatedPrice, 100);
  const workerApi = setup(worker, { Job }).route("jobs");
  for (const status of ["worker_accepted", "on_the_way", "arrived", "work_started", "completion_requested"]) {
    const result = await workerApi.PATCH(request("jobs", "PATCH", { jobId: C, status, ...(status === "work_started" ? { startOtp: "1234" } : {}) }));
    assert.equal(result.status, 200, status);
    const data = (await result.json()).data; assert.equal(data.startOtp, undefined); assert.equal(data.completionOtp, undefined);
  }
  assert.equal(stored.startOtp, undefined);
  const customerApi = setup(customer, { Job }).route("jobs");
  const completed = await customerApi.PATCH(request("jobs", "PATCH", { jobId: C, status: "completed", completionOtp: "1234" }));
  assert.equal(completed.status, 200); assert.equal(stored.finalPrice, 100); assert.equal(stored.completionOtp, undefined);
  assert.equal((await customerApi.PATCH(request("jobs", "PATCH", { jobId: C, status: "completed", completionOtp: "1234" }))).status, 409);
});
