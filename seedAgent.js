import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "./models/DeliveryAgent.js";
import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

const seedAgent = async () => {
    try {
        await connectDB();

        const email = "agent@foodfusion.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ Agent user not found. Please register an agent first with email: " + email);
            process.exit(1);
        }

        let agent = await DeliveryAgent.findOne({ user: user._id });

        if (!agent) {
            console.log("Creating agent entry...");
            agent = new DeliveryAgent({
                user: user._id,
                isApproved: true,
                isAvailable: true,
                activeDeliveriesCount: 0
            });
            await agent.save();
        } else {
            console.log("Updating existing agent...");
            agent.isApproved = true;
            agent.isAvailable = true;
            await agent.save();
        }

        console.log("✅ Agent seeded and approved successfully!");
        console.log(agent);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

seedAgent();
