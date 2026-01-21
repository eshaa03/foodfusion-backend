import User from "../models/User.js";

import Restaurant from "../models/Restaurant.js";
import Order from "../models/Order.js";

export const getUsers = async (req, res) => {
  try {
    let query = {};

    // If admin (not superadmin), restrict to their restaurant's customers
    if (req.user.role === 'admin') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.json({ message: "Users list", user: req.user, users: [] });
      }

      // Find all orders for this restaurant to get user IDs
      const orders = await Order.find({ restaurant: restaurant._id }).select('user');
      const userIds = [...new Set(orders.map(o => o.user.toString()))];

      query = { _id: { $in: userIds } };
    }

    const users = await User.find(query).select("-password");

    res.json({
      message: "Users list",
      user: req.user,      // currently logged-in user
      users: users         // filtered users from DB
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
