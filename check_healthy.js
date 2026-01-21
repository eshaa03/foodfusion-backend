
import mongoose from 'mongoose';
import Food from './models/Food.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const foods = await Food.find({});
        console.log(`Total Food Items: ${foods.length}`);

        const healthyFoods = foods.filter(f => f.isHealthy);
        console.log(`Healthy Food Items: ${healthyFoods.length}`);

        if (healthyFoods.length > 0) {
            console.log("Healthy Sample:", JSON.stringify(healthyFoods.slice(0, 3), null, 2));
        } else {
            console.log("No healthy items found.");
            console.log("First 3 items:", JSON.stringify(foods.slice(0, 3), null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
