import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "./models/DeliveryAgent.js";
import connectDB from "./config/db.js";

dotenv.config();

const checkAgents = async () => {
    try {
        await connectDB();
        const agents = await DeliveryAgent.find({});
        console.log("Total Agents:", agents.length);
        console.log("Agents Details:", JSON.stringify(agents, null, 2));

        const available = await DeliveryAgent.findOne({ isApproved: true, isAvailable: true });
        console.log("Best Available Candidate:", available);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAgents();
