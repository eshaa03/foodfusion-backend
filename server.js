import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoute.js";
import foodRoutes from "./routes/foodRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import userRoutes from "./routes/userRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import profileRoutes from "./routes/profileRoute.js";
import restaurantRoutes from "./routes/restaurantRoute.js"; // ✅ CORRECT
// Duplicate removed
import agentRoutes from "./routes/agentRoute.js";
import { toggleAvailability, getAgentStatus } from "./controllers/agentController.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { roleMiddleware } from "./middleware/roleMiddleware.js";
dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://foodfusion-123.web.app",
      "https://foodfusion-123.firebaseapp.com"
    ],
    credentials: true,
  })
);


app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
console.log("Registering /api/agent routes...");
app.use("/api/agent", agentRoutes);

// EMERGENCY DIRECT ROUTES
app.put("/api/agent/toggle-status", authMiddleware, roleMiddleware(["agent"]), toggleAvailability);
app.get("/api/agent/status", authMiddleware, roleMiddleware(["agent"]), getAgentStatus);

// ✅ THIS IS WHAT YOUR FRONTEND CALLS
app.use("/api/restaurants", restaurantRoutes);

//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("FoodFusion Backend Running");
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
