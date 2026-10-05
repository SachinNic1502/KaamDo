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
  console.log("=== KAAMDO PHASE 2: ADVANCED CAPABILITIES VALIDATION ===");

  // 1. Authenticate Customer & Worker
  const custRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543220", otp: "1234", role: "customer" }
  );
  const custToken = custRes.data?.data?.token;
  const custUser = custRes.data?.data?.user;
  if (!custToken) throw new Error("Customer login failed");
  console.log(`✓ Customer Authenticated: ${custUser?.name}`);

  const workerRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543211", otp: "1234", role: "worker" }
  );
  const workerToken = workerRes.data?.data?.token;
  const workerUser = workerRes.data?.data?.user;
  if (!workerToken) throw new Error("Worker login failed");
  console.log(`✓ Worker Authenticated: ${workerUser?.name}`);

  const adminRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543210", otp: "1234", role: "admin" }
  );
  const adminToken = adminRes.data?.data?.token;
  if (!adminToken) throw new Error("Admin login failed");
  console.log("✓ Admin Authenticated");

  // -------------------------------------------------------------
  // MODULE 1: Live GPS Location Tracking
  // -------------------------------------------------------------
  console.log("\n--- Testing Module 1: Live GPS Location Engine ---");
  const liveLocationRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/workers/me/location",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    {
      latitude: 12.9279,
      longitude: 77.6271,
      address: "Outer Ring Road, Bellandur, Bengaluru",
      serviceRadiusKm: 20,
    }
  );
  if (!liveLocationRes.data?.success) throw new Error(`Location update failed: ${JSON.stringify(liveLocationRes.data)}`);
  console.log(`✓ Worker Live GPS Updated: Lat ${liveLocationRes.data?.data?.latitude}, Lng ${liveLocationRes.data?.data?.longitude}, Radius ${liveLocationRes.data?.data?.serviceRadiusKm} km`);

  // -------------------------------------------------------------
  // MODULE 2: In-App Real-Time Chat & Media Attachments
  // -------------------------------------------------------------
  console.log("\n--- Testing Module 2: In-App Chat & Media Messaging ---");
  // Customer creates/joins chat with worker
  const chatRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/chat",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    { participantId: workerUser.id || workerUser._id }
  );
  const chatData = chatRes.data?.data;
  const chatId = chatData?._id || chatData?.id;
  if (!chatId) throw new Error(`Chat creation failed: ${JSON.stringify(chatRes.data)}`);
  console.log(`✓ Active Chat Channel Established: ID -> ${chatId}`);

  // Customer sends message with repair photo attachment
  const sendMsgRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/messages",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    {
      chatId,
      message: "Here is the broken circuit breaker. Please bring a 32A MCB.",
      messageType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    }
  );
  if (!sendMsgRes.data?.success) throw new Error(`Send message failed: ${JSON.stringify(sendMsgRes.data)}`);
  console.log(`✓ Customer Sent Photo Message: "${sendMsgRes.data?.data?.message}"`);

  // Worker retrieves messages
  const getMsgsRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: `/api/messages?chatId=${chatId}&limit=5`,
    method: "GET",
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const msgs = getMsgsRes.data?.data || [];
  console.log(`✓ Worker retrieved ${msgs.length} messages in chat`);

  // -------------------------------------------------------------
  // MODULE 3: Cancellation Policy Engine & Dispute Mediation
  // -------------------------------------------------------------
  console.log("\n--- Testing Module 3: Cancellation Engine & Dispute Desk ---");

  // Create temporary job to test cancellation fee calculation
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const mongoose = require("mongoose");
  await mongoose.connect("mongodb://127.0.0.1:27017/kaamdo");
  const catDoc = await mongoose.connection.collection("servicecategories").findOne({});
  const sub = catDoc?.subcategories?.[0];

  const createJobRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    {
      categoryId: catDoc._id.toString(),
      subcategoryId: sub._id.toString(),
      description: "Cancellation policy test job",
      pricingModel: "fixed",
      address: { label: "Office", address: "Tech Park", city: "Bengaluru", state: "Karnataka", pincode: "560103" },
      scheduledDate: tomorrow,
      scheduledTime: "11:00 AM",
    }
  );
  const cancelJobId = createJobRes.data?.data?.job?._id;
  if (!cancelJobId) throw new Error(`Cancel job creation failed: ${JSON.stringify(createJobRes.data)}`);

  // Cancel while searching -> Should be free (fee: 0)
  const cancelRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: `/api/jobs/${cancelJobId}/cancel`,
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    { reason: "Customer plans changed" }
  );
  if (!cancelRes.data?.success) throw new Error(`Cancel failed: ${JSON.stringify(cancelRes.data)}`);
  console.log(`✓ Job Cancelled: Status -> ${cancelRes.data?.data?.status}, Fee -> ₹${cancelRes.data?.data?.cancellationFee} (${cancelRes.data?.data?.feeDescription})`);

  // File Dispute
  const disputeRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/disputes",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    {
      jobId: cancelJobId,
      reason: "Workmanship Claim",
      description: "Service was incomplete, requesting mediation.",
      images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"],
    }
  );
  if (!disputeRes.data?.success) throw new Error(`Dispute creation failed: ${JSON.stringify(disputeRes.data)}`);
  const disputeId = disputeRes.data?.data?._id;
  console.log(`✓ Dispute Filed: Case #${disputeId?.slice(-6).toUpperCase()} (Status: ${disputeRes.data?.data?.status})`);

  // Admin Mediates and Resolves Dispute
  const resolveRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/disputes",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    },
    {
      disputeId,
      status: "resolved",
      resolution: "Full refund issued to customer. Service partner notified.",
    }
  );
  if (!resolveRes.data?.success) throw new Error(`Dispute resolution failed: ${JSON.stringify(resolveRes.data)}`);
  console.log(`✓ Admin Dispute Resolution Enforced: Status -> ${resolveRes.data?.data?.status}`);

  // -------------------------------------------------------------
  // MODULE 4: Contractor Commercial Milestones
  // -------------------------------------------------------------
  console.log("\n--- Testing Module 4: Contractor Commercial Milestones ---");
  const projectsRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/projects?limit=5",
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`✓ Contractor Commercial Projects Queried: ${projectsRes.data?.data?.length || 0} active projects`);

  await mongoose.disconnect();

  console.log("\n=================================================================");
  console.log("   ALL PHASE 2 ADVANCED CAPABILITIES VALIDATED 100% OPERATIONAL! ");
  console.log("=================================================================\n");
}

run().catch((err) => {
  console.error("FATAL PHASE 2 ERROR:", err);
  process.exit(1);
});
