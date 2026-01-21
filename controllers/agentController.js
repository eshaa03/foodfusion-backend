import DeliveryAgent from "../models/DeliveryAgent.js";

/* TOGGLE AVAILABILITY */
export const toggleAvailability = async (req, res) => {
    try {
        let agent = await DeliveryAgent.findOne({ user: req.user._id });

        if (!agent) {
            // Auto-create agent profile if missing
            agent = new DeliveryAgent({
                user: req.user._id,
                isAvailable: false,
                isApproved: true,   // Auto-approve
            });
        }

        // TOGGLE LOGIC
        agent.isAvailable = !agent.isAvailable;

        // FORCE APPROVAL for testing if it was somehow false
        if (!agent.isApproved) agent.isApproved = true;

        await agent.save();

        res.json({
            isAvailable: agent.isAvailable,
            message: agent.isAvailable ? "You are now Online" : "You are now Offline"
        });
    } catch (err) {
        console.error("Toggle Availability Error:", err);
        res.status(500).json({ message: "Failed to update availability" });
    }
};

/* GET CURRENT STATUS */
export const getAgentStatus = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) return res.json({ isAvailable: false });

        res.json({ isAvailable: agent.isAvailable });
    } catch (err) {
        console.error("Get Agent Status Error:", err);
        res.status(500).json({ message: "Failed to fetch status" });
    }
};
