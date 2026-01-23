import express from "express";
import {
  getAdminFoods,
  getFoodsByRestaurant,
  getPublicFoods,
  createFood,
  deleteFood,
  updateFood,
  addReview,
  getReviews,
} from "../controllers/foodController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/cloudinary.js";

const router = express.Router();

/* ================= PUBLIC ================= */

router.get("/", getPublicFoods);
router.get("/restaurant/:restaurantId", getFoodsByRestaurant);

/* ================= ADMIN ================= */

router.get("/admin", authMiddleware, roleMiddleware(["admin"]), getAdminFoods);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("image"),
  createFood
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("image"),
  updateFood
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteFood
);

/* ================= REVIEWS ================= */

router.post("/:id/reviews", authMiddleware, addReview);
router.get("/:id/reviews", getReviews);

export default router;
