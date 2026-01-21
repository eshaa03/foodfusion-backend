import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    image: {
      type: String, // logo / cover image
    },

    cuisine: {
      type: String,
    },

    description: {
      type: String,
    },

    rating: {
      type: Number,
      default: 0,
    },

    deliveryTime: {
      type: String,
    },

    address: {
      type: String,
    },

    discount: {
      type: String,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dietaryType: {
      type: String,
      enum: ["Healthy", "Normal", "Both"],
      default: "Normal",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
