import express from "express";
import { getCart, updateCart, removeCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/", updateCart);
router.delete("/:userId/:itemId", removeCartItem);

export default router;
