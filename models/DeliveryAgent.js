import mongoose from "mongoose";

const deliveryAgentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false, // superadmin approves agent
    },

    activeDeliveriesCount: {
      type: Number,
      default: 0,
    },

    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryAgent", deliveryAgentSchema);
