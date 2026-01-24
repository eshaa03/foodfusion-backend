import express from "express";
import { 
  getPublicRestaurants,
  getMyRestaurant,
  updateMyRestaurant
} from "../controllers/restaurantController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// PUBLIC – USER APP
router.get("/", getPublicRestaurants);

// ADMIN – restaurant profile
router.get("/me", authMiddleware, getMyRestaurant);
router.put("/me", authMiddleware, upload.single("image"), updateMyRestaurant);

export default router;
