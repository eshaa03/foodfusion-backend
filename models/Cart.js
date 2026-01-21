// backend/models/Cart.js
import mongoose from "mongoose";

const CustomizationSchema = new mongoose.Schema({
  ingredients: [String],
  portionSize: String,
  quantity: { type: Number, default: 1 },
});

const CartItemSchema = new mongoose.Schema({
  item: {
    id: String,
    name: String,
    image: String,
    price: Number,
  },
  qty: { type: Number, default: 1 },
  customizations: CustomizationSchema,
});

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);
