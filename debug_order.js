import mongoose from 'mongoose';
import Order from './models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const orderIdFragment = "7c196d"; // From screenshot

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Find order where _id ends with fragment or just list last 5 orders
        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);

        console.log("Checking last 5 orders for match...");
        let found = false;
        for (const order of orders) {
            if (order._id.toString().endsWith(orderIdFragment)) {
                console.log("MATCH FOUND:");
                console.log(JSON.stringify(order, null, 2));
                found = true;
            }
        }

        if (!found) {
            console.log("No partial match found in last 5. Dumping partials:");
            orders.forEach(o => console.log(o._id.toString()));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
