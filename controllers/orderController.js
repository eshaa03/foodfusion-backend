import Order from "../models/Order.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Food from "../models/Food.js";
import DeliveryAgent from "../models/DeliveryAgent.js";

/* CREATE ORDER */
/* CREATE ORDER */
export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, totalAmount, pointsToRedeem } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    // 1. Validate Points (Don't deduct yet)
    let finalDiscount = 0;
    let userToUpdate = null;

    if (pointsToRedeem && pointsToRedeem > 0) {
      const user = await User.findById(req.user._id);
      if (user.redeemPoints < pointsToRedeem) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      userToUpdate = user;
      finalDiscount = pointsToRedeem;
    }

    // Fix: Use ID of the first item to find the food and restaurant
    const firstItem = items[0];
    const foodId = firstItem.food || firstItem.foodId;
    const query = foodId ? { _id: foodId } : { name: firstItem.name };

    const food = await Food.findOne(query).populate("restaurant");

    if (!food || !food.restaurant) {
      return res.status(400).json({
        message: "Food or restaurant not found",
      });
    }

    // 2. Create Order
    const order = await Order.create({
      user: req.user._id,
      restaurant: food.restaurant._id,
      items: items.map(item => ({
        food: item.food || item.foodId || food._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        customizations: item.customizations,
      })),
      address,
      paymentMethod,
      // Auto-mark paid if UPI (assuming mocked gateway success)
      isPaid: paymentMethod === "UPI",
      totalAmount, // This should be the Final Paid Amount from frontend
      discount: finalDiscount,
      status: "Placed",
      deliveryStatus: "Unassigned",
    });

    // 3. Deduct Points (Only if order created successfully)
    if (userToUpdate && finalDiscount > 0) {
      userToUpdate.redeemPoints -= finalDiscount;
      await userToUpdate.save();
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
};


/* GET USER ORDERS */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "items.food",
        select: "name image price description category isHealthy isVegetarian isVegan"
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get My Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* UPDATE ORDER STATUS */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const role = req.user.role;

    /* ============================
       ADMIN / RESTAURANT LOGIC
    ============================ */
    if (role === "admin" || role === "superadmin") {
      console.log(`Admin update: ${req.user._id} | Role: ${role} | Status: ${status}`);

      // Allow "Placed" as well so they can reset or initial update without error
      if (!["Placed", "Preparing", "Ready"].includes(status)) {
        console.warn(`Invalid status update attempt: ${status}`);
        return res
          .status(403)
          .json({ message: "Invalid admin status update" });
      }

      order.status = status;

      // 🔥 AUTO ASSIGN AGENT WHEN READY
      if (status === "Ready") {
        console.log("Status is 'Ready'. Attempting auto-assignment...");
        const agent = await findBestAgent();

        if (agent) {
          console.log(`✅ Agent found: ${agent._id} (User: ${agent.user})`);
          order.deliveryAgent = agent._id;
          order.deliveryStatus = "Assigned";

          agent.activeDeliveriesCount = (agent.activeDeliveriesCount || 0) + 1;
          agent.isAvailable = false;

          if (!agent.activeOrder) {
            agent.activeOrder = order._id; // Track current active order if not tracking multiple
          }

          await agent.save();
          console.log("Agent assigned and status updated to Assigned.");
        } else {
          console.warn("⚠️ No available agent found for assignment.");
        }
      }

      // Populate delivery agent details AND user details for the response
      await order.populate([
        {
          path: "deliveryAgent",
          populate: {
            path: "user",
            select: "name phone"
          }
        },
        {
          path: "user",
          select: "name phone"
        }
      ]);
    }

    /* ============================
       DELIVERY AGENT LOGIC
    ============================ */
    if (role === "agent") {
      const allowedAgentStatuses = [
        "Assigned",
        "accepted",
        "picked_up",
        "in_transit",
        "Delivered",
        "Accepted", // Legacy
        "Picked Up", // Legacy
        "In Transit" // Legacy
      ];

      if (!allowedAgentStatuses.includes(status)) {
        return res
          .status(403)
          .json({ message: "Invalid agent status update" });
      }

      order.deliveryStatus = status;

      // ✅ FREE AGENT AFTER DELIVERY
      if (status === "Delivered" && order.deliveryAgent) {
        const agent = await DeliveryAgent.findById(order.deliveryAgent);
        if (agent) {
          agent.activeDeliveriesCount = Math.max(
            (agent.activeDeliveriesCount || 1) - 1,
            0
          );
          agent.isAvailable = true;
          await agent.save();
        }

        // 🌟 CREDIT POINTS IF PAID
        if (order.isPaid && !order.pointsCredited) {
          const points = Math.floor(order.totalAmount * 1); // 1 point per Rupee for now (or 10% logic) - let's do 10% to be realistic
          const pointsToAdd = Math.floor(order.totalAmount * 0.1);

          if (pointsToAdd > 0) {
            const user = await User.findById(order.user);
            if (user) {
              user.redeemPoints = (user.redeemPoints || 0) + pointsToAdd;
              await user.save();
              order.pointsCredited = true;
            }
          }
        }
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};


export const getAdminOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (!restaurant) return res.json([]);

    const orders = await Order.find({
      restaurant: restaurant._id,
    })
      .populate("user", "name phone email")
      .populate({
        path: "items.food",
        select: "name category image price"
      })
      .populate({
        path: "deliveryAgent",
        populate: {
          path: "user",
          select: "name phone"
        },
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Admin Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


export const assignDeliveryAgent = async (req, res) => {
  const { orderId, agentId } = req.body;

  const order = await Order.findById(orderId);
  const agent = await DeliveryAgent.findById(agentId);

  if (!order || !agent) {
    return res.status(404).json({ message: "Order or Agent not found" });
  }

  order.deliveryAgent = agent._id;
  order.status = "Out for Delivery";

  agent.activeOrder = order._id;
  agent.isAvailable = false;

  await order.save();
  await agent.save();

  res.json({ message: "Agent assigned successfully" });
};

export const getAgentOrders = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findOne({ user: req.user._id });

    if (!agent) return res.json([]);

    const orders = await Order.find({
      deliveryAgent: agent._id,
    })
      .populate("restaurant")
      .populate("user", "name phone");

    res.json(orders);
  } catch (err) {
    console.error("Agent Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch agent orders" });
  }
};

export const getAllOrdersSuperAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "user",
        select: "name phone email",
        options: { strictPopulate: false },
      })
      .populate({
        path: "restaurant",
        select: "name",
        options: { strictPopulate: false },
      })
      .populate({
        path: "deliveryAgent",
        populate: {
          path: "user",
          select: "name phone email"
        },
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("SuperAdmin Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


const findBestAgent = async () => {
  // Find agents who are approved and available
  // Sort by active deliveries (least busy first)
  const agent = await DeliveryAgent.findOne({
    isApproved: true,
    isAvailable: true,
  }).sort({ activeDeliveriesCount: 1 });

  return agent;
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("restaurant", "name")
    .populate("deliveryAgent", "name");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
  res.json(order);
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const activeCustomers = await User.countDocuments({ role: "user" });
    const pendingOrders = await Order.countDocuments({ status: "Placed" });
    const activeDeliveries = await Order.countDocuments({ status: "Out for Delivery" });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeCustomers,
      pendingOrders,
      activeDeliveries,
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/* MARK ORDER AS PAID */
export const markOrderAsPaid = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { collectionMethod } = req.body; // "Cash" or "UPI"

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    order.isPaid = true;
    order.paymentResult = {
      id: "PAY-" + Date.now(),
      collectionMethod: collectionMethod || "Cash",
    };

    // 🌟 CREDIT POINTS IF DELIVERED
    if ((order.status === "Delivered" || order.deliveryStatus === "Delivered") && !order.pointsCredited) {
      const pointsToAdd = Math.floor(order.totalAmount * 0.1);

      if (pointsToAdd > 0) {
        const user = await User.findById(order.user);
        if (user) {
          user.redeemPoints = (user.redeemPoints || 0) + pointsToAdd;
          await user.save();
          order.pointsCredited = true;
        }
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error("Mark Paid Error:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
};
/* CANCEL ORDER (USER) */
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure only the user who placed the order can cancel it
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // CHECK STATUS: Only Allow Cancellation if "Placed"
    // If it is "Preparing", "Ready", "Out for Delivery" etc, do not allow.
    if (order.status !== "Placed") {
      return res.status(400).json({ message: "Cannot cancel order once it is being prepared" });
    }

    order.status = "Cancelled";
    order.deliveryStatus = "Cancelled"; // Ensure delivery status is also synced

    // REFUND POINTS IF REDEEMED
    if (order.discount > 0) {
      const user = await User.findById(order.user);
      if (user) {
        user.redeemPoints += order.discount;
        await user.save();
        console.log(`Refunded ${order.discount} points to user ${user._id}`);
      }
    }

    await order.save();
    res.json({ message: "Order cancelled successfully", order });

  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};
