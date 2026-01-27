import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "../models/Restaurant.js";

dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const result = await Restaurant.updateMany(
      { image: { $regex: "^/uploads" } },
      { $set: { image: "" } }
    );

    console.log(`✅ Cleaned ${result.modifiedCount} restaurant image fields`);
    process.exit();
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
};

cleanup();
