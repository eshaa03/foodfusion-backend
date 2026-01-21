import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Restaurant from "../models/Restaurant.js";

// REGISTER
// REGISTER
export const registerUser = async (req, res) => {
  try {
    console.log("Register Request Body:", req.body); // DEBUG
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", email); // DEBUG
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create user (password hashed by schema)
    const user = new User({
      name,
      email,
      password,
      role: role || "user",
    });

    console.log("Saving user..."); // DEBUG
    await user.save();
    console.log("User saved:", user._id); // DEBUG

    // ✅ IF ADMIN → CREATE RESTAURANT
    if (user.role === "admin") {
      console.log("Creating restaurant for admin..."); // DEBUG
      try {
        await Restaurant.create({
          name: name,
          owner: user._id,
          cuisine: "",
          description: "",
          rating: 0,
          isFeatured: false,
        });
      } catch (restErr) {
        console.error("Failed to create restaurant:", restErr); // DEBUG
        // Continue execution, don't crash registration? Or revert?
      }
    }

    console.log("Generating token..."); // DEBUG
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    // ✅ Fix: Check if user exists BEFORE accessing properties
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (
      (user.role === "admin" || user.role === "agent") &&
      !user.isApproved
    ) {
      return res.status(403).json({
        message: "Your account is pending superadmin approval",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const approveUser = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isApproved = true;
  await user.save();

  res.json({ message: "User approved successfully" });
};

// GET pending admins & agents
export const getPendingApprovals = async (req, res) => {
  const users = await User.find({
    role: { $in: ["admin", "agent"] },
    isApproved: false,
  }).select("name email role createdAt");

  res.json(users);
};

// GET all admins (approved & pending)
export const getAdmins = async (req, res) => {
  const admins = await User.find({
    role: "admin",
  }).select("name email createdAt isApproved");

  res.json(admins);
};

// GET all delivery agents (approved & pending)
export const getAgents = async (req, res) => {
  const agents = await User.find({
    role: "agent",
  }).select("name email createdAt isApproved");

  res.json(agents);
};

// GET all approved users (admin + agent) for history
export const getApprovedUsers = async (req, res) => {
  const users = await User.find({
    role: { $in: ["admin", "agent"] },
    isApproved: true,
  }).select("name email role createdAt");

  res.json(users);
};
