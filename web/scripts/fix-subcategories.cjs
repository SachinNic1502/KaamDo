const mongoose = require("mongoose");

async function fixSubcategories() {
  await mongoose.connect("mongodb://127.0.0.1:27017/kaamdo");
  const collection = mongoose.connection.collection("servicecategories");
  const categories = await collection.find({}).toArray();

  for (const cat of categories) {
    let modified = false;
    const updatedSubcategories = (cat.subcategories || []).map((sub) => {
      const updated = { ...sub };
      if (!updated._id) {
        updated._id = new mongoose.Types.ObjectId();
        modified = true;
      }
      if (!updated.slug) {
        updated.slug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        modified = true;
      }
      return updated;
    });

    if (modified) {
      const updateDoc = {
        $set: {
          subcategories: updatedSubcategories,
        },
      };
      await collection.updateOne({ _id: cat._id }, updateDoc);
      console.log(`Updated category: ${cat.name} (${updatedSubcategories.length} subcategories)`);
    }
  }

  console.log("Subcategory migration completed successfully.");
  await mongoose.disconnect();
}

fixSubcategories().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
