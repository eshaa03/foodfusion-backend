import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: false,
            trim: true,
            maxLength: 500,
        },
    },
    { timestamps: true }
);

// Prevent duplicate reviews from same user for same food
reviewSchema.index({ food: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
