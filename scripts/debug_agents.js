import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "../models/DeliveryAgent.js";
import User from "../models/User.js";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("Connection Error:", err);
        process.exit(1);
    }
};

const debugAgents = async () => {
    await connectDB();

    console.log("\n--- DEBUGGING AGENTS ---");

    const agents = await DeliveryAgent.find().populate("user", "name role");

    if (agents.length === 0) {
        console.log("❌ No Delivery Agents found in database.");
    } else {
        agents.forEach(agent => {
            console.log(`\nID: ${agent._id}`);
            console.log(`User: ${agent.user ? agent.user.name : "UNKNOWN"} (${agent.user ? agent.user.role : "N/A"})`);
            console.log(`Available (isAvailable): ${agent.isAvailable} ${agent.isAvailable ? "✅" : "❌"}`);
            console.log(`Approved (isApproved): ${agent.isApproved} ${agent.isApproved ? "✅" : "❌"}`);
            // Check active deliveries
            console.log(`Active Deliveries: ${agent.activeDeliveriesCount}`);
        });
    }

    console.log("\n------------------------\n");
    process.exit();
};

debugAgents();
