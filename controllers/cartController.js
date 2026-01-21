// backend/controllers/cartController.js
import Cart from "../models/Cart.js";
import asyncHandler from "express-async-handler";

// @desc    Get cart for a user
// @route   GET /api/cart/:userId
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    // If no cart exists, create an empty one
    cart = await Cart.create({ userId, items: [] });
  }

  res.status(200).json(cart.items);
});

// @desc    Add or update items in cart
// @route   POST /api/cart
// @access  Private
export const updateCart = asyncHandler(async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !items) {
    res.status(400);
    throw new Error("userId and items are required");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items });
  } else {
    cart.items = items;
    await cart.save();
  }

  res.status(200).json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:userId/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const { userId, itemId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter((item) => item.item.id !== itemId);
  await cart.save();

  res.status(200).json(cart.items);
});
