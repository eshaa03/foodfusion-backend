import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27019/foodfusion");
        console.log("Connected to DB");

        const restaurants = await Restaurant.find({});
        console.log(`Total Restaurants: ${restaurants.length}`);

        restaurants.forEach(r => {
            console.log(`- ID: ${r._id}`);
            console.log(`  Name: ${r.name}`);
            console.log(`  DietaryType: ${r.dietaryType}`);
            console.log(`  Cuisine: ${r.cuisine}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
