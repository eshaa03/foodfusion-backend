
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import Food from "../models/Food.js";
import Review from "../models/Review.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parents
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const recalculateRatings = async () => {
    try {
        await connectDB();

        console.log("Fetching all foods...");
        const foods = await Food.find({});

        console.log(`Found ${foods.length} foods. Recalculating...`);

        for (const food of foods) {
            const reviews = await Review.find({ food: food._id });
            const count = reviews.length;

            let avgRating = 0;
            if (count > 0) {
                const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                avgRating = sum / count;
            }

            food.rating = avgRating;
            food.reviews = count;
            await food.save();
            console.log(`Updated ${food.name}: ${avgRating} stars (${count} reviews)`);
        }

        console.log("All done!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

recalculateRatings();
