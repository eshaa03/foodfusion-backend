import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import SystemSettings from "../models/SystemSettings.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeCustomers = await User.countDocuments({ role: "user" });
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["Placed", "Preparing"] },
    });
    const activeDeliveries = await Order.countDocuments({
      deliveryStatus: { $in: ["Assigned", "Accepted", "Picked Up", "In Transit"] },
    });

    const revenueData = await Order.aggregate([
      { $match: { deliveryStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    res.json({
      totalOrders,
      totalRevenue,
      activeCustomers,
      pendingOrders,
      activeDeliveries,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

export const getMyRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  res.json(restaurant);
};

export const updateMyRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  // ✅ ADD THIS
  if (req.file) {
    restaurant.image = `/uploads/${req.file.filename}`;
  }

  Object.assign(restaurant, req.body);
  await restaurant.save();

  res.json(restaurant);
};



export const recalculateRatings = async (req, res) => {
  try {
    const foods = await Food.find({});
    let updatedCount = 0;

    for (const food of foods) {
      const reviews = await Review.find({ food: food._id });
      const count = reviews.length;

      let avgRating = 0;
      if (count > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        avgRating = sum / count;
      }

      food.rating = avgRating;
      food.reviews = count;
      await food.save();
      updatedCount++;
    }

    res.json({ message: `Successfully recalculated ratings for ${updatedCount} items` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to recalculate" });
  }
};

export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to update settings" });
  }
};
