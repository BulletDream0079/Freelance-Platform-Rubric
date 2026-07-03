require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const [, , argName, argEmail, argPassword] = process.argv;
  const name = argName || process.env.ADMIN_NAME;
  const email = (argEmail || process.env.ADMIN_EMAIL || "").toLowerCase();
  const password = argPassword || process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Usage: node scripts/createAdmin.js "Name" email@site.com password');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`✓ Promoted existing user ${email} to admin.`);
    } else {
      console.log(`✓ Admin ${email} already exists.`);
    }
    await mongoose.disconnect();
    return;
  }

  await User.create({ name, email, password, role: "admin" });
  console.log(`✓ Admin account created: ${email}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
