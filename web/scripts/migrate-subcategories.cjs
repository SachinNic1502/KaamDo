const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config({ path: [".env.local", ".env"] });

async function migrateSubcategories() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/kaamdo";
  console.log("Connecting to:", uri);

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const categoriesCol = db.collection("servicecategories");

    const categories = await categoriesCol.find({}).toArray();
    console.log(`Found ${categories.length} categories.`);

    for (const cat of categories) {
      const updatedSubs = (cat.subcategories || []).map((s) => {
        const sub = { ...s };
        if (!sub._id) {
          sub._id = new ObjectId();
        }
        if (!sub.slug) {
          sub.slug = (sub.name || "service")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        }
        if (sub.isActive === undefined || sub.isActive === null) {
          sub.isActive = true;
        }
        return sub;
      });

      await categoriesCol.updateOne(
        { _id: cat._id },
        {
          $set: {
            subcategories: updatedSubs,
            isActive: true,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✓ Updated category "${cat.name}": assigned ${updatedSubs.length} subcategory IDs & slugs.`);
    }

    console.log("\nAll subcategories now possess persistent ObjectIds and slugs.");
  } finally {
    await client.close();
  }
}

migrateSubcategories().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
