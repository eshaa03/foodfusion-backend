import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: [
      {
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
        },
        name: String,
        price: Number,
        qty: Number,
        customizations: {
          ingredients: [String],
          portionSize: String,
        },
      },
    ],

    address: {
      fullName: String,
      phone: String,
      house: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI"],
      required: true,
    },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      collectionMethod: { type: String, enum: ["Cash", "UPI"] }
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    /* =========================
       FOOD PREPARATION STATUS
    ========================= */
    status: {
      type: String,
      enum: ["Placed", "Preparing", "Ready"],
      default: "Placed",
    },

    /* =========================
       DELIVERY TRACKING STATUS
    ========================= */
    deliveryStatus: {
      type: String,
      enum: [
        "Unassigned",
        "Assigned",
        "accepted", // New
        "picked_up", // New
        "in_transit", // New
        "arrived", // New
        "Accepted", // Old (Keep for compatibility if needed)
        "Picked Up",
        "In Transit",
        "Delivered",
      ],
      default: "Unassigned",
    },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent",
      default: null,
    },

    pointsCredited: {
      type: Boolean,
      default: false,
    },

    discount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
