import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "./models/DeliveryAgent.js";
import connectDB from "./config/db.js";

dotenv.config();

const diagnoseAgents = async () => {
    try {
        await connectDB();
        console.log("--- AGENT DIAGNOSTICS ---");

        const allAgents = await DeliveryAgent.find().populate("user", "name email");
        console.log(`Total Agents Found: ${allAgents.length}`);

        allAgents.forEach(a => {
            console.log(`Agent: ${a.user?.name} (${a.user?.email}) | ID: ${a._id}`);
            console.log(`   Approved: ${a.isApproved}`);
            console.log(`   Available: ${a.isAvailable}`);
            console.log(`   Active Deliveries: ${a.activeDeliveriesCount}`);
            console.log("-------------------------");
        });

        const bestAgent = await DeliveryAgent.findOne({
            isApproved: true,
            isAvailable: true,
        }).sort({ activeDeliveriesCount: 1 });

        if (bestAgent) {
            console.log("✅ SUCCESS: Found a candidate for assignment:");
            console.log(bestAgent);
        } else {
            console.log("❌ FAILURE: No suitable agent found for assignment.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

diagnoseAgents();
