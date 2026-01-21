import express from "express";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getAdminOrders,
  assignDeliveryAgent,
  getAllOrdersSuperAdmin,
  getOrderById,
  getDashboardStats,
  markOrderAsPaid,
  cancelOrder,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router(); // ✅ MUST BE FIRST

// USER
router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.put("/:id/cancel", authMiddleware, cancelOrder);

// SUPER ADMIN
router.get(
  "/superadmin",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  getAllOrdersSuperAdmin
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["superadmin", "admin"]), // Allow both roles
  getDashboardStats
);

router.post(
  "/assign-agent",
  authMiddleware,
  roleMiddleware(["superadmin"]),
  assignDeliveryAgent
);

// RESTAURANT ADMIN
router.get("/admin", authMiddleware, getAdminOrders);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.post("/:orderId/pay", authMiddleware, markOrderAsPaid);
router.get("/:id", authMiddleware, getOrderById);

export default router;
