const { execSync } = require("child_process");

console.log("=================================================================");
console.log("             KAAMDO MASTER PLATFORM VALIDATION SUITE              ");
console.log("=================================================================\n");

const tests = [
  { name: "Step 1: Live Job Lifecycle & Real-Time Dispatch", script: "scripts/test-job-lifecycle.cjs" },
  { name: "Step 2: Worker KYC Submission & Admin Verification Desk", script: "scripts/test-kyc-flow.cjs" },
  { name: "Step 3: Payment Gateway & Automated Settlement", script: "scripts/test-payment-flow.cjs" },
  { name: "Step 4: Push Notifications Engine (Expo Push / FCM)", script: "scripts/test-push-notifications.cjs" },
];

let allPassed = true;

for (const test of tests) {
  console.log(`\n>>> RUNNING: ${test.name} ...`);
  try {
    const output = execSync(`node ${test.script}`, { stdio: "inherit" });
    console.log(`[PASS] ${test.name}\n`);
  } catch (err) {
    console.error(`[FAIL] ${test.name}`);
    allPassed = false;
    break;
  }
}

if (allPassed) {
  console.log("\n=================================================================");
  console.log("  ALL 4 STEPS VALIDATED AND FULLY OPERATIONAL ACROSS KAAMDO!    ");
  console.log("=================================================================\n");
  process.exit(0);
} else {
  console.error("\nMaster test suite failed on one of the steps.");
  process.exit(1);
}
