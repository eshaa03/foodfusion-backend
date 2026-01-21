import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryAgent from "./models/DeliveryAgent.js";
import connectDB from "./config/db.js";

dotenv.config();

const debugAssignment = async () => {
    try {
        await connectDB();
        console.log("\n=================================");
        console.log("   AGENT ASSIGNMENT DEBUGGER");
        console.log("=================================\n");

        const agents = await DeliveryAgent.find().populate("user", "name email");
        console.log(`Found ${agents.length} delivery agent records.\n`);

        let availableCount = 0;

        for (const agent of agents) {
            console.log(`Agent: ${agent.user?.name || "Unknown"} (Email: ${agent.user?.email})`);
            console.log(`   ID: ${agent._id}`);
            console.log(`   Approved: ${agent.isApproved}  ${agent.isApproved ? "✅" : "❌ (Cannot be assigned)"}`);
            console.log(`   Available: ${agent.isAvailable} ${agent.isAvailable ? "✅" : "❌ (Cannot be assigned)"}`);
            console.log(`   Active Deliveries: ${agent.activeDeliveriesCount}`);

            if (agent.isApproved && agent.isAvailable) {
                console.log("   >>> ELIGIBLE FOR ASSIGNMENT <<<");
                availableCount++;
            } else {
                console.log("   --- Not eligible ---");
            }
            console.log("---------------------------------\n");
        }

        if (availableCount === 0) {
            console.log("❌ CRITICAL: No agents are currently eligible for assignment!");
            console.log("Action: Login as an agent and toggle 'Online', or ensure the agent is approved by SuperAdmin.");
        } else {
            console.log(`✅ SUCCESS: There are ${availableCount} agents ready to accept orders.`);
            console.log("If assignment still fails, check the 'findBestAgent' query logic.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugAssignment();
