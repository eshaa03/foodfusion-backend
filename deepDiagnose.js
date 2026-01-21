import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";
import DeliveryAgent from "./models/DeliveryAgent.js";
import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

const deepDiagnose = async () => {
    try {
        await connectDB();
        console.log("--- DEEP DIAGNOSTICS ---");

        // 1. Check Specific Order
        const orderId = "696dbc3d4b948e52ba7c196d";
        // Check if ID is valid ObjectId, if not try to find by other means or skip
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            const order = await Order.findById(orderId);
            console.log(`\nOrder ${orderId}:`);
            if (order) {
                console.log(`  Status: ${order.status}`);
                console.log(`  DeliveryAgent: ${order.deliveryAgent}`);
                console.log(`  DeliveryStatus: ${order.deliveryStatus}`);
            } else {
                console.log("  Order not found!");
            }
        } else {
            console.log(`\nOrder ID ${orderId} is likely invalid from OCR/Screenshot. Skipping generic lookup.`);
        }

        // 2. Check All Agents
        console.log("\n--- AGENTS ---");
        const agents = await DeliveryAgent.find().populate("user", "name email");
        console.log(`Total Agents: ${agents.length}`);

        agents.forEach(a => {
            console.log(`\nAgent: ${a.user?.name} (${a.user?.email})`);
            console.log(`  ID: ${a._id}`);
            console.log(`  isApproved: ${a.isApproved}`);
            console.log(`  isAvailable: ${a.isAvailable}`);
            console.log(`  activeDeliveriesCount: ${a.activeDeliveriesCount}`);
            console.log(`  activeOrder: ${a.activeOrder}`);
        });

        // 3. Test findBestAgent Query
        console.log("\n--- QUERY TEST ---");
        const bestAgent = await DeliveryAgent.findOne({
            isApproved: true,
            isAvailable: true,
        }).sort({ activeDeliveriesCount: 1 });

        if (bestAgent) {
            console.log("✅ Query SUCCESS. Would assign to:", bestAgent.user?.name);
        } else {
            console.log("❌ Query FAILED. No agents match {isApproved: true, isAvailable: true}");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

deepDiagnose();
