import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import DeliveryAgent from "./models/DeliveryAgent.js";
import connectDB from "./config/db.js";

dotenv.config();

const verifyProfiles = async () => {
    try {
        await connectDB();
        console.log("--- Verifying Agent Profiles ---");

        // 1. Find all users with role 'agent'
        const agentUsers = await User.find({ role: "agent" });
        console.log(`Found ${agentUsers.length} users with role 'agent'.`);

        for (const user of agentUsers) {
            // 2. Check for DeliveryAgent record
            const profile = await DeliveryAgent.findOne({ user: user._id });

            console.log(`\nUser: ${user.name} (${user.email})`);
            console.log(`ID: ${user._id}`);

            if (profile) {
                console.log(`✅ Profile found: ${profile._id}`);
                console.log(`   Approved: ${profile.isApproved}`);
                console.log(`   Available: ${profile.isAvailable}`);
            } else {
                console.log(`❌ NO PROFILE FOUND! This user cannot be assigned.`);

                // Auto-fix?
                console.log(`   Attempting to create profile...`);
                await DeliveryAgent.create({
                    user: user._id,
                    name: user.name, // Fallback if name not in user
                    isApproved: true,
                    isAvailable: true
                });
                console.log(`   ✅ Created and Approved profile for ${user.name}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

verifyProfiles();
