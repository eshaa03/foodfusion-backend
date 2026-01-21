import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect("mongodb://127.0.0.1:27019/foodfusion");
        console.log("Connected.");

        console.log("Fetching Restaurants...");
        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants.`);

        if (restaurants.length > 0) {
            console.log("Sample:", restaurants[0]);
        }
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
