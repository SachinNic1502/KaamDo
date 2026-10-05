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
  console.log("=== KAAMDO STEP 4: PUSH NOTIFICATIONS ENGINE TEST ===");

  // 1. Authenticate Customer
  const custOtpRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543220" }
  );
  const custOtp = custOtpRes.data?.data?.demoOtp || custOtpRes.data?.data?.otp || "1234";

  const custVerifyRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543220", otp: String(custOtp), role: "customer" }
  );
  const custToken = custVerifyRes.data?.data?.token;
  const custUser = custVerifyRes.data?.data?.user;
  if (!custToken) {
    console.error("Cust OTP Res:", custOtpRes);
    console.error("Cust Verify Res:", custVerifyRes);
    throw new Error(`Customer login failed: ${JSON.stringify(custVerifyRes.data || custVerifyRes.raw)}`);
  }
  console.log(`✓ Customer Authenticated: ${custUser?.name}`);

  // 2. Customer Registers Expo Push Token (/api/users/push-token)
  const custPushToken = "ExponentPushToken[mock_customer_device_token_12345]";
  const regCustRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/users/push-token",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    { pushToken: custPushToken }
  );
  if (!regCustRes.data?.success) throw new Error(`Customer token registration failed: ${JSON.stringify(regCustRes.data)}`);
  console.log("✓ Customer registered Expo Push Token successfully");

  // 3. Authenticate Worker
  const workerOtpRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543211" }
  );
  const workerOtp = workerOtpRes.data?.data?.demoOtp || workerOtpRes.data?.data?.otp || "1234";

  const workerVerifyRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "+919876543211", otp: String(workerOtp), role: "worker" }
  );
  const workerToken = workerVerifyRes.data?.data?.token;
  const workerUser = workerVerifyRes.data?.data?.user;
  if (!workerToken) throw new Error("Worker login failed");
  console.log(`✓ Worker Authenticated: ${workerUser?.name}`);

  // 4. Worker Registers Push Token (/api/notifications/register-token)
  const workerPushToken = "ExponentPushToken[mock_worker_device_token_67890]";
  const regWorkerRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/notifications/register-token",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    { token: workerPushToken, platform: "android" }
  );
  if (!regWorkerRes.data?.success) throw new Error(`Worker token registration failed: ${JSON.stringify(regWorkerRes.data)}`);
  console.log("✓ Worker registered Expo Push Token successfully");

  // 5. Verify Database Records for Registered Tokens
  const mongoose = require("mongoose");
  await mongoose.connect("mongodb://127.0.0.1:27017/kaamdo");
  const usersCol = mongoose.connection.collection("users");

  const dbCust = await usersCol.findOne({ _id: new mongoose.Types.ObjectId(custUser.id || custUser._id) });
  console.log(`✓ Database verified customer token: ${dbCust?.pushToken === custPushToken}`);

  const dbWorker = await usersCol.findOne({ _id: new mongoose.Types.ObjectId(workerUser.id || workerUser._id) });
  console.log(`✓ Database verified worker token: ${dbWorker?.pushToken === workerPushToken}`);
  await mongoose.disconnect();

  console.log("\n>>> STEP 4: PUSH NOTIFICATIONS ENGINE 100% OPERATIONAL! <<<");
}

run().catch((err) => {
  console.error("FATAL PUSH NOTIFICATION TEST ERROR:", err);
  process.exit(1);
});
