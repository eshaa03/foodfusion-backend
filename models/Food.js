import mongoose from "mongoose";

const portionSchema = new mongoose.Schema({
  id: String,
  label: String,
  multiplier: Number,
});

const ingredientSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  icon: String,
});

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: String,

    basePrice: { type: Number, required: true },

    portions: [portionSchema],
    ingredients: [ingredientSchema],

    // ✅ ADD THIS (LINK FOOD → RESTAURANT)
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    category: String,

    // 🔥 MODE CONTROL
    mode: {
      type: String,
      enum: ["diet", "normal", "both"],
      default: "both",
    },

    // 🔥 AVAILABILITY CONTROL
    isAvailable: {
      type: Boolean,
      default: true,
    },


    isHealthy: { type: Boolean, default: false },
    calories: Number,
    protein: Number,

    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);


export default mongoose.model("Food", foodSchema);
