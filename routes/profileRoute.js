import express from "express";
import { getProfile, updateProfile, toggleFavorite, addAddress, deleteAddress, getFavorites, getRedeemPoints, redeemPoints, } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put('/address', authMiddleware, addAddress);
router.delete("/address/:id", authMiddleware, deleteAddress);
router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites", authMiddleware, toggleFavorite);
router.get("/redeem-points", authMiddleware, getRedeemPoints);
router.post("/redeem", authMiddleware, redeemPoints);



export default router;
