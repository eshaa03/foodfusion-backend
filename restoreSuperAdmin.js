import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import connectDB from "./config/db.js";
import fs from "fs";

dotenv.config();

const logFile = "restoration_result.txt";

const logResult = (message) => {
    fs.appendFileSync(logFile, message + "\n");
    console.log(message);
};

const restoreSuperAdmin = async () => {
    try {
        logResult("Starting restoration...");
        await connectDB();

        const email = "superadmin@foodfusion.com";
        const password = "superadmin123";
        const name = "Super Admin";
        const role = "superadmin";

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logResult("⚠️ Super Admin already exists.");
            process.exit(0);
        }

        // Create new Super Admin
        const superAdmin = new User({
            name,
            email,
            password, // Will be hashed by pre-save hook
            role,
            isApproved: true,
            phone: "0000000000",
            addresses: [{
                fullName: name,
                phone: "0000000000",
                house: "Admin HQ",
                street: "Admin St",
                city: "Admin City",
                state: "Admin State",
                pincode: "000000",
                label: "Work",
                isDefault: true
            }]
        });

        await superAdmin.save();
        logResult("✅ Super Admin restored successfully!");

        process.exit(0);
    } catch (error) {
        logResult("❌ Error restoring Super Admin: " + error.message);
        console.error(error);
        process.exit(1);
    }
};

restoreSuperAdmin();
