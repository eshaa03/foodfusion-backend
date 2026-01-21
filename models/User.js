import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "agent", "user"],
      default: "user",
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "user" || this.role === "superadmin";
      },
    },



    phone: String,

    addresses: [
      {
        fullName: String,
        phone: String,
        house: String,
        street: String,
        city: String,
        state: String,
        pincode: String,
        label: {
          type: String,
          enum: ["Home", "Work", "Other"],
          default: "Home",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    paymentMethods: [
      {
        type: {
          type: String, // COD / UPI / CARD
        },
        label: String,
        cardNumber: String, // Storing only last 4 actual digits recommended in real apps
        cardHolder: String,
        expiry: String,
        upiId: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    notifications: {
      orderUpdates: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      newRestaurants: { type: Boolean, default: true },
      walletUpdates: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
    },


    privacySettings: {
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },

    favorites: {
      type: [String], // array of food item IDs
      default: [],
    },


    redeemPoints: {
      type: Number,
      default: 0,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },

  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
