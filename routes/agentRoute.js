import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { getAgentOrders } from "../controllers/orderController.js";
import { updateOrderStatus } from "../controllers/orderController.js";
import { toggleAvailability, getAgentStatus } from "../controllers/agentController.js";

const router = express.Router();

console.log("Loading Agent Routes...");
// DELIVERY AGENT - TOGGLE AVAILABILITY
router.put(
  "/toggle-status",
  authMiddleware,
  roleMiddleware(["agent"]),
  toggleAvailability
);

// FALLBACK FOR FRONTEND CALLING /status
router.put(
  "/status",
  authMiddleware,
  roleMiddleware(["agent"]),
  toggleAvailability
);

// DELIVERY AGENT - GET STATUS
router.get(
  "/status",
  authMiddleware,
  roleMiddleware(["agent"]),
  getAgentStatus
);

// DELIVERY AGENT – VIEW ASSIGNED ORDERS
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware(["agent"]),
  getAgentOrders
);

// DELIVERY AGENT – MARK ORDER DELIVERED
router.put(
  "/orders/:id/delivered",
  authMiddleware,
  roleMiddleware(["agent"]),
  async (req, res) => {
    req.body.status = "Delivered";
    return updateOrderStatus(req, res);
  }
);

export default router;
