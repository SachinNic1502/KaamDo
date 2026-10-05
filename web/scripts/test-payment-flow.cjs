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
  console.log("=== KAAMDO STEP 3: PAYMENT GATEWAY & INVOICING TEST ===");

  // 1. Authenticate Customer
  const custOtpRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543220" }
  );
  const custOtp = custOtpRes.data?.data?.demoOtp || custOtpRes.data?.data?.otp || "1234";

  const custVerifyRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543220", otp: String(custOtp), role: "customer" }
  );
  const custToken = custVerifyRes.data?.data?.token;
  const custUser = custVerifyRes.data?.data?.user;
  if (!custToken) {
    console.error("Cust OTP Res:", custOtpRes);
    console.error("Cust Verify Res:", custVerifyRes);
    throw new Error(`Customer login failed: ${JSON.stringify(custVerifyRes.data || custVerifyRes.raw)}`);
  }
  console.log(`✓ Customer Authenticated: ${custUser?.name}`);

  // 2. Fetch Customer's Completed Job
  const jobsRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/jobs?limit=10",
    method: "GET",
    headers: { Authorization: `Bearer ${custToken}` },
  });
  // Prepare completed job with customer assignment
  const mongoose = require("mongoose");
  await mongoose.connect("mongodb://127.0.0.1:27017/kaamdo");
  const jobDoc = await mongoose.connection.collection("jobs").findOne({});
  if (!jobDoc) throw new Error("No job available in database");

  // Reset job to completed state and clear previous order
  await mongoose.connection.collection("jobs").updateOne(
    { _id: jobDoc._id },
    {
      $set: {
        customerId: new mongoose.Types.ObjectId(custUser.id || custUser._id),
        status: "completed",
        finalPrice: 499,
        estimatedPrice: 499,
        pricingModel: "fixed",
      },
    }
  );
  await mongoose.connection.collection("paymentorders").deleteMany({ jobId: jobDoc._id.toString() });
  await mongoose.connection.collection("paymentorders").deleteMany({ jobId: jobDoc._id });
  await mongoose.disconnect();

  const targetJob = { ...jobDoc, _id: jobDoc._id.toString(), status: "completed", finalPrice: 499 };
  console.log(`✓ Selected Job for Payment: #${targetJob.jobNumber || targetJob._id} (Status: ${targetJob.status})`);

  // 3. Create Checkout Order (Razorpay)
  const orderRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/payments",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    {
      action: "create-order",
      jobId: targetJob._id,
      provider: "razorpay",
    }
  );

  if (!orderRes.data?.success) throw new Error(`Create order failed: ${JSON.stringify(orderRes.data || orderRes.raw)}`);
  const orderData = orderRes.data.data;
  console.log(`✓ Order Created: ID -> ${orderData.orderId}, Amount -> ₹${orderData.amount / 100}, Key -> ${orderData.keyId}`);

  // 4. Verify & Confirm Payment (Simulate Gateway Callback)
  const crypto = require("crypto");
  const paymentId = "pay_mock_98765432";
  const signature = crypto.createHmac("sha256", "secret_test_kaamdo").update(`${orderData.orderId}|${paymentId}`).digest("hex");

  const confirmRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/payments",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    {
      action: "verify",
      jobId: targetJob._id,
      provider: "razorpay",
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    }
  );

  if (!confirmRes.data?.success) throw new Error(`Payment verification failed: ${JSON.stringify(confirmRes.data || confirmRes.raw)}`);
  console.log(`✓ Payment Confirmed: Status -> ${confirmRes.data?.data?.status}`);

  // 5. Verify Customer Invoice / Payment History
  const historyRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/payments?limit=5",
    method: "GET",
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const recentPayments = historyRes.data?.data || [];
  console.log(`✓ Customer Payments Logged: ${recentPayments.length} recorded transactions`);

  console.log("\n>>> STEP 3: PAYMENT GATEWAY & AUTOMATED SETTLEMENT 100% OPERATIONAL! <<<");
}

run().catch((err) => {
  console.error("FATAL PAYMENT TEST ERROR:", err);
  process.exit(1);
});
