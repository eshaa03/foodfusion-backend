
import mongoose from "mongoose";

const systemSettingsSchema = mongoose.Schema(
    {
        deliveryFee: { type: Number, default: 40 },
        taxRate: { type: Number, default: 5 },
        minOrderValue: { type: Number, default: 100 },
        siteMaintenance: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);

export default SystemSettings;
