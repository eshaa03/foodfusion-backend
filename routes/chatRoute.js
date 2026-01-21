import express from "express";
import { chatWithGroq } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chatWithGroq);

export default router;
