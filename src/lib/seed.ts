import connectDB from "@/db/db";
import { User } from "@/db/models";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/config";
import bcrypt from "bcrypt";

async function seedAdminUser() {
  try {
    await connectDB(); // Connect to the database

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const newAdmin = new User({
        email: ADMIN_EMAIL,
        password: hashedPassword,
      });
      await newAdmin.save();
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

async function main() {
  await seedAdminUser();
}

main(); 