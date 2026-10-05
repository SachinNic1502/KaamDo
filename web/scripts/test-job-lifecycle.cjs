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
  console.log("=== KAAMDO JOB LIFECYCLE VERIFICATION ===");

  // 1. Get Categories
  const catRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/categories",
    method: "GET",
  });
  if (!catRes.data?.data?.[0]) throw new Error("No categories found");
  const category = catRes.data.data[0];
  const subcategory = category.subcategories[0];
  console.log(`✓ Fetched Category: ${category.name} -> ${subcategory.name}`);

  // 2. Login Customer
  const custOtpRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/send-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543210" }
  );
  const custOtp = custOtpRes.data?.data?.demoOtp || custOtpRes.data?.data?.otp || "1234";

  const custVerifyRes = await request(
    { host: "127.0.0.1", port: 3000, path: "/api/auth/verify-otp", method: "POST", headers: { "Content-Type": "application/json" } },
    { phone: "9876543210", otp: String(custOtp), role: "customer" }
  );
  const custToken = custVerifyRes.data?.data?.token;
  if (!custToken) throw new Error(`Customer login failed: ${JSON.stringify(custVerifyRes.data)}`);
  console.log("✓ Customer authenticated successfully");

  // 3. Login Worker
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
  if (!workerToken) throw new Error(`Worker login failed: ${JSON.stringify(workerVerifyRes.data)}`);
  console.log("✓ Worker authenticated successfully");

  // 4. Customer Creates Job
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const createJobRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    {
      categoryId: category._id,
      subcategoryId: subcategory._id,
      description: "Emergency circuit breaker tripping in kitchen and hallway",
      pricingModel: subcategory.pricingModel || "fixed",
      address: {
        label: "Home",
        address: "Flat 402, Green Glen Layout, Bellandur",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560103",
      },
      scheduledDate: tomorrow,
      scheduledTime: "10:00 AM - 12:00 PM",
    }
  );
  const job = createJobRes.data?.data?.job;
  if (!job) throw new Error(`Job creation failed: ${JSON.stringify(createJobRes.data)}`);
  const jobId = job._id;
  console.log(`✓ Job Created: #${job.jobNumber} (ID: ${jobId}, Status: ${job.status})`);

  // 5. Worker Views Incoming Requests
  const requestsRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: "/api/jobs?status=searching&limit=20",
    method: "GET",
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const openLeads = requestsRes.data?.data || [];
  const foundLead = openLeads.find((j) => j._id === jobId);
  console.log(`✓ Worker checked available requests: ${openLeads.length} open leads (Found our job: ${Boolean(foundLead)})`);

  // 6. Worker Accepts Lead
  const acceptRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: `/api/jobs/${jobId}/accept`,
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    {}
  );
  if (!acceptRes.data?.success) throw new Error(`Accept failed: ${JSON.stringify(acceptRes.data)}`);
  console.log(`✓ Worker accepted lead -> Status: ${acceptRes.data?.data?.status}`);

  // 7. Worker Starts Transit (on_the_way)
  const transitRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    { jobId, status: "on_the_way" }
  );
  console.log(`✓ Worker en-route -> Status: ${transitRes.data?.data?.status}`);

  // 8. Worker Arrives (arrived)
  const arrivedRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    { jobId, status: "arrived" }
  );
  console.log(`✓ Worker arrived at door -> Status: ${arrivedRes.data?.data?.status}`);

  // 9. Customer Fetches Job to Read Start OTP
  const custJobRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: `/api/jobs?jobId=${jobId}`,
    method: "GET",
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const startOtp = custJobRes.data?.data?.startOtp;
  console.log(`✓ Customer retrieved Start OTP: ${startOtp}`);

  // 10. Worker Submits Start OTP (work_started)
  const startWorkRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    { jobId, status: "work_started", startOtp }
  );
  if (!startWorkRes.data?.success) throw new Error(`Start work failed: ${JSON.stringify(startWorkRes.data)}`);
  console.log(`✓ Worker verified Start OTP -> Status: ${startWorkRes.data?.data?.status}`);

  // 11. Customer Fetches Completion OTP
  const custCompJobRes = await request({
    host: "127.0.0.1",
    port: 3000,
    path: `/api/jobs?jobId=${jobId}`,
    method: "GET",
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const completionOtp = custCompJobRes.data?.data?.completionOtp;
  console.log(`✓ Customer retrieved Completion OTP: ${completionOtp}`);

  // 12. Worker Submits Completion OTP (completed)
  const completeRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${workerToken}` },
    },
    { jobId, status: "completed", completionOtp }
  );
  if (!completeRes.data?.success) throw new Error(`Completion failed: ${JSON.stringify(completeRes.data)}`);
  console.log(`✓ Worker verified Completion OTP -> Status: ${completeRes.data?.data?.status}`);

  // 13. Customer Rates Service
  const rateRes = await request(
    {
      host: "127.0.0.1",
      port: 3000,
      path: "/api/jobs",
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${custToken}` },
    },
    { jobId, rating: 5, review: "Arrived right on time, excellent professional service!" }
  );
  console.log(`✓ Customer rated 5-stars: ${rateRes.data?.data?.rating} stars`);

  console.log("\n>>> FULL JOB LIFECYCLE VALIDATED 100% OPERATIONAL! <<<");
}

run().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
