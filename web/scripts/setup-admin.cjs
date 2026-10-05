const mongoose = require("mongoose");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/kaamdo");
  const users = mongoose.connection.collection("users");
  
  await users.updateOne(
    { phone: "9876543210" },
    {
      $set: {
        role: "admin",
        isActive: true,
        isPhoneVerified: true,
      },
    }
  );

  await users.updateOne(
    { phone: "9876543211" },
    {
      $set: {
        role: "worker",
        isActive: true,
      },
    }
  );

  console.log("Admin (9876543299) and Worker (9876543211) configured successfully.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
