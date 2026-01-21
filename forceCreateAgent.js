import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "./models/DeliveryAgent.js";
import User from "./models/User.js";
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";

dotenv.config();

const forceCreateAgent = async () => {
    try {
        await connectDB();

        const email = "agent007@foodfusion.com";
        const password = "password123";
        const name = "James Bond";

        // 1. Create or Get User
        let user = await User.findOne({ email });
        if (!user) {
            console.log("Creating new user...");
            user = new User({
                name,
                email,
                password,
                role: "agent",
                isApproved: true,
                phone: "9999999999",
                addresses: [{
                    fullName: name,
                    phone: "9999999999",
                    house: "HQ",
                    street: "MI6",
                    city: "London",
                    state: "UK",
                    pincode: "007007",
                    label: "Work",
                    isDefault: true
                }]
            });
            await user.save();
        } else {
            console.log("User exists, updating...");
            user.role = "agent";
            user.isApproved = true;
            await user.save();
        }

        // 2. Create or Get Agent
        let agent = await DeliveryAgent.findOne({ user: user._id });
        if (!agent) {
            console.log("Creating delivery agent entry...");
            agent = new DeliveryAgent({
                user: user._id,
                isApproved: true,
                isAvailable: true,
                activeDeliveriesCount: 0
            });
            await agent.save();
        } else {
            console.log("Updating delivery agent entry...");
            agent.isApproved = true;
            agent.isAvailable = true;
            await agent.save();
        }

        console.log("✅ FORCED AGENT CREATION SUCCESSFUL");
        console.log(`Agent: ${user.name} (${user.email})`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

forceCreateAgent();
