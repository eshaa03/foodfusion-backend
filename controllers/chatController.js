import Groq from "groq-sdk";
import dotenv from "dotenv";
import Food from "../models/Food.js";

dotenv.config();

// ... imports
export const chatWithGroq = async (req, res) => {
  try {
    const { message, history = [], isDietMode } = req.body;

    console.log("👉 Chat Request Received:", message);

    // 1. Validate API Key
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ ERROR: GROQ_API_KEY is missing from .env");
      throw new Error("Missing GROQ_API_KEY in backend .env");
    }

    // 2. Fetch Menu
    console.log("👉 Fetching menu from DB...");
    const foods = await Food.find({ isAvailable: true })
      .select("name basePrice ingredients calories isHealthy mode restaurant")
      .limit(20)
      .lean(); // Use lean() for plain JS objects

    console.log(`👉 Found ${foods.length} menu items.`);

    if (foods.length === 0) {
      console.warn("⚠️ Warning: No food items found in DB.");
    }

    const menuContext = foods
      .map(
        (f) =>
          `- ${f.name} (₹${f.basePrice}): ${f.isHealthy ? "[HEALTHY] " : ""}${f.calories ? f.calories + "kcal" : ""}`
      )
      .join("\n");

    const systemInstruction = `
You are the AI Assistant for "FoodFusion".
MENU DATA:
${menuContext}
CONTEXT:
Diet Mode: ${isDietMode ? "ON" : "OFF"}.
RULES:
Recommend from MENU above.
ALWAYS use "₹" for prices (e.g. ₹200). Never use "$".
`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    console.log("👉 Sending request to Groq...");
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...history,
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "No reply from AI.";
    console.log("👉 Groq Replied successfully.");

    res.json({ reply });
  } catch (error) {
    console.error("❌ CHATBOT ERROR:", error);
    // Return the ACTUAL error to the frontend for debugging
    res.status(500).json({
      reply: `Error: ${error.message} (Check backend terminal for details)`,
      error: error.toString(),
    });
  }
};
