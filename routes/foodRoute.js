import express from "express";
import {
  getAdminFoods,
  getFoodsByRestaurant,
  getPublicFoods,
  createFood,
  deleteFood,
  updateFood,
} from "../controllers/foodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ✅ USER APP (PUBLIC) */
router.get("/", getPublicFoods);

/* ✅ ADMIN */
router.get("/admin", authMiddleware, getAdminFoods); // 🔥 ADD THIS
router.post("/", authMiddleware, upload.single("image"), createFood);
router.put("/:id", authMiddleware, upload.single("image"), updateFood); // ✅ NEW
router.delete("/:id", authMiddleware, deleteFood);

/* OPTIONAL (USER) */
router.get("/restaurant/:restaurantId", getFoodsByRestaurant);

/* ✅ REVIEWS */
import { addReview, getReviews } from "../controllers/foodController.js";
router.post("/:id/reviews", authMiddleware, addReview);
router.get("/:id/reviews", getReviews);


export default router;
