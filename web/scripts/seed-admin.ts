import mongoose from "mongoose";
import { hashPassword } from "../src/lib/auth";
import User from "../src/lib/models/user.model";
import { phoneSchema } from "../src/lib/validations";
async function seedAdmin() {
  try {
    const phone = phoneSchema.parse({ phone: process.env.ADMIN_PHONE }).phone;
    // Password is required - no default/seed password for security
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error("ADMIN_PASSWORD environment variable is required - no default seed password");
    const name = process.env.ADMIN_NAME?.trim();
    if (!name || name.length < 2) throw new Error("ADMIN_NAME is required");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:6379/kaamdo");
    if (await User.exists({ role: "admin" })) { console.log("An admin already exists; no changes made."); return; }
    await User.create({ name, phone, password: await hashPassword(password), role: "admin", isActive: true, isPhoneVerified: false });
    console.log("Admin created. No hardcoded credentials.");
  } catch { console.error("Admin creation failed. Check required ADMIN_NAME, ADMIN_PHONE, ADMIN_PASSWORD and database configuration."); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
}
void seedAdmin();