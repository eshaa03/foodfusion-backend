import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const checkUserPhone = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const user = await User.findOne({ name: "Tanjiro" });
        if (user) {
            console.log("User found:", user.name);
            console.log("Phone:", user.phone);
            console.log("Full Object:", user);
        } else {
            console.log("User Tanjiro not found");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUserPhone();
