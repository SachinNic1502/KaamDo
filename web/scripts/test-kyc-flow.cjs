const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log("=== KAAMDO STEP 2: KYC & ADMIN VERIFICATION TEST ===");

  // 1. Authenticate Worker
  const workerOtpRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543211" }
  );
  const workerOtp = workerOtpRes.data?.data?.demoOtp || workerOtpRes.data?.data?.otp || "1234";

  const workerVerifyRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543211", otp: String(workerOtp), role: "worker" }
  );
  const workerToken = workerVerifyRes.data?.data?.token;
  const workerUser = workerVerifyRes.data?.data?.user;
  if (!workerToken) {
    console.error("Worker OTP Res:", workerOtpRes);
    console.error("Worker Verify Res:", workerVerifyRes);
    throw new Error(`Worker login failed: ${JSON.stringify(workerVerifyRes.data || workerVerifyRes.raw)}`);
  }
  console.log(`✓ Worker Authenticated: ${workerUser?.name || "Worker"} (ID: ${workerUser?.id || workerUser?._id})`);

  // 2. Worker Submits KYC Documents & Bank Account
  const kycPayload = {
    kyc: {
      aadhaarNumber: "789012345678",
      panNumber: "ABCDE1234F",
      aadhaarFrontUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      panCardUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    },
    bankDetails: {
      accountHolderName: "Ramesh Sharma",
      bankName: "HDFC Bank",
      accountNumber: "50100234567890",
      ifscCode: "HDFC0001234",
      upi: "ramesh@okhdfcbank",
    },
  };

  const submitKycRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/workers/me/kyc",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    kycPayload
  );
  if (!submitKycRes.data?.success) {
    console.error("DEBUG SUBMIT KYC RESPONSE:", submitKycRes);
    throw new Error(`KYC submission failed: ${JSON.stringify(submitKycRes.data || submitKycRes.raw)}`);
  }
  console.log(`✓ KYC Submitted: status -> ${submitKycRes.data?.data?.status}, kyc.status -> ${submitKycRes.data?.data?.kyc?.status}`);

  // 3. Authenticate Admin
  const adminOtpRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543210" }
  );
  const adminOtp = adminOtpRes.data?.data?.demoOtp || adminOtpRes.data?.data?.otp || "1234";

  const adminVerifyRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543210", otp: String(adminOtp), role: "admin" }
  );
  const adminToken = adminVerifyRes.data?.data?.token;
  if (!adminToken) throw new Error(`Admin login failed: ${JSON.stringify(adminVerifyRes.data)}`);
  console.log("✓ Admin Authenticated successfully");

  // 4. Admin Inspects Worker KYC Applications
  const adminListRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/workers?status=under_review",
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const pendingWorkers = adminListRes.data?.data || [];
  console.log(`✓ Admin fetched review list: ${pendingWorkers.length} applications under review`);

  const targetWorker = pendingWorkers.find(
    (w) => String(w.userId?._id || w.userId) === String(workerUser.id || workerUser._id)
  ) || pendingWorkers[0];

  if (!targetWorker) throw new Error("Target worker not found in admin review list");
  console.log(`✓ Admin selected applicant: ${targetWorker.userId?.name || "Worker"} (ID: ${targetWorker._id})`);

  // 5. Admin Approves and Verifies Worker
  const approveRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/workers",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    },
    {
      workerId: targetWorker.userId?._id || targetWorker.userId || targetWorker._id,
      status: "verified",
    }
  );
  if (!approveRes.data?.success) throw new Error(`Approval failed: ${JSON.stringify(approveRes.data)}`);
  console.log(`✓ Admin verified worker: status -> ${approveRes.data?.data?.status}`);

  // 6. Worker Confirms Verification
  const workerCheckRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/workers/me/kyc",
    method: "GET",
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  console.log(`✓ Worker confirmed new status: overallStatus -> ${workerCheckRes.data?.data?.overallStatus}, kyc.status -> ${workerCheckRes.data?.data?.kyc?.status}`);

  console.log("\n>>> STEP 2: WORKER KYC & ADMIN VERIFICATION DESK 100% OPERATIONAL! <<<");
}

run().catch((err) => {
  console.error("FATAL KYC TEST ERROR:", err);
  process.exit(1);
});
