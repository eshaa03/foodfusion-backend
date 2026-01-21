import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
  getMyRestaurant,
  updateMyRestaurant,
  getDashboardStats,
  getSystemSettings,
  updateSystemSettings,
} from "../controllers/adminController.js";


const router = express.Router();

/* ADMIN STATS */
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  getDashboardStats
);

/* RESTAURANT PROFILE */
router.get(
  "/restaurant",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  getMyRestaurant
);

router.put(
  "/restaurant",
  authMiddleware,
  roleMiddleware(["admin", "superadmin"]),
  upload.single("image"),   // ✅ ADD THIS LINE
  updateMyRestaurant
);

/* SYSTEM SETTINGS */
router.get("/settings", authMiddleware, roleMiddleware(["superadmin"]), getSystemSettings);
router.put("/settings", authMiddleware, roleMiddleware(["superadmin"]), updateSystemSettings);


export default router;
