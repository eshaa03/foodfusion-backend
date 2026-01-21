
import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js";
import dotenv from "dotenv";

dotenv.config();

const seedRestaurants = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27019/foodfusion");

        const count = await Restaurant.countDocuments();
        if (count > 0) {
            console.log("Restaurants already exist.");
            process.exit();
        }

        const sample = new Restaurant({
            name: "Fusion Delight",
            description: "Best confusion food",
            address: "123 Flavor St",
            cuisine: "Fusion",
            dietaryType: "Veg",
            image: "default.jpg",
            rating: 4.5
        });

        await sample.save();
        console.log("✅ Seeded one restaurant.");
        process.exit();
    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedRestaurants();

