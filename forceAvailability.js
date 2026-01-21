import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "./models/DeliveryAgent.js";
import connectDB from "./config/db.js";

dotenv.config();

const forceAvailability = async () => {
    try {
        await connectDB();
        console.log("Forcing agent availability...");

        // Reset all agents to available
        const result = await DeliveryAgent.updateMany(
            {},
            { $set: { isAvailable: true, isApproved: true } }
        );

        console.log(`Updated ${result.modifiedCount} agents to AVAILABLE & APPROVED.`);

        const agents = await DeliveryAgent.find().populate('user', 'name');
        console.log(JSON.stringify(agents, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

forceAvailability();
