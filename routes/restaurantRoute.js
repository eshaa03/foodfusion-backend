import express from "express";
import { getPublicRestaurants } from "../controllers/restaurantController.js";

const router = express.Router();

// PUBLIC – USER APP
router.get("/", getPublicRestaurants);

export default router;
