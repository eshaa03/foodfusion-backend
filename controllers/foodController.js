import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import Review from "../models/Review.js"; // ✅ ADD

// ✅ ADD REVIEW
export const addReview = async (req, res) => {
  try {
    const { id } = req.params; // foodId
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // 1. Check if food exists
    const food = await Food.findById(id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    
    const existingReview = await Review.findOne({ food: id, user: userId });

    if (existingReview) {
      // ✅ Allow updating the review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      // ✅ Create New Review
      await Review.create({
        food: id,
        user: userId,
        rating,
        comment,
      });
    }

    // 4. Recalculate Average Rating
    const reviews = await Review.find({ food: id });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    // 5. Update Food
    food.rating = avgRating;
    food.reviews = reviews.length;
    await food.save();

    res.status(201).json({ message: "Review added", rating: avgRating, reviews: reviews.length });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};

// ✅ GET REVIEWS
export const getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ food: id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};


export const getAdminFoods = async (req, res) => {
  try {
    // ✅ SUPER ADMIN → SEE ALL FOODS
    if (req.user.role === "superadmin") {
      const foods = await Food.find()
        .populate("restaurant", "name");
      return res.status(200).json(foods);
    }

    // ✅ RESTAURANT ADMIN → SEE ONLY THEIR FOODS
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(200).json([]);
    }

    const foods = await Food.find({
      restaurant: restaurant._id,
    });

    res.status(200).json(foods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};


export const createFood = async (req, res) => {
  try {
    const {
      name,
      category,
      basePrice,
      portions,
      ingredients,
      imageUrl,
    } = req.body;

    // ✅ FIND RESTAURANT OF LOGGED-IN ADMIN
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(403).json({ message: "No restaurant found for admin" });
    }

    const food = await Food.create({
      name,
      category,
      basePrice: Number(basePrice),

      portions: portions
        ? JSON.parse(portions)
        : [],

      ingredients: ingredients
        ? JSON.parse(ingredients)
        : [],

      image: req.file ? req.file.path : imageUrl || "",


      isAvailable: true,

      // ✅ LINK FOOD → RESTAURANT
      restaurant: restaurant._id,
    });

    res.status(201).json(food);
  } catch (err) {
    console.error("Create food error:", err);
    res.status(400).json({ message: "Food creation failed" });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      basePrice,
      portions,
      ingredients,
      imageUrl,
      mode,
      isAvailable,
    } = req.body;

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // ✅ CHECK OWNERSHIP (Skip for Super Admin)
    if (req.user.role !== "superadmin") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (!restaurant || food.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this food" });
      }
    }

    // ✅ UPDATE FIELDS
    food.name = name || food.name;
    food.category = category || food.category;
    food.basePrice = basePrice ? Number(basePrice) : food.basePrice;
    food.mode = mode || food.mode;
    food.isAvailable = isAvailable !== undefined ? isAvailable : food.isAvailable;

    if (portions) food.portions = JSON.parse(portions);
    if (ingredients) food.ingredients = JSON.parse(ingredients);

    // ✅ IMAGE UPDATE
    if (req.file) {
      food.image = req.file.path;
    } else if (imageUrl) {
      food.image = imageUrl;
    }

    await food.save();
    res.json(food);
  } catch (err) {
    console.error("Update food error:", err);
    res.status(500).json({ message: "Failed to update food" });
  }
};

export const deleteFood = async (req, res) => {
  const { id } = req.params;

  const food = await Food.findById(id);
  if (!food) {
    return res.status(404).json({ message: "Food not found" });
  }

  await food.deleteOne();
  res.json({ message: "Food deleted successfully" });
};

// ✅ PUBLIC: USER APP
export const getPublicFoods = async (req, res) => {
  try {
    const foods = await Food.find({
      // isAvailable: true, // ❌ REMOVE to show unavailable items (they appear grayscale)
    }).populate("restaurant", "name image address");

    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};

export const getFoodsByRestaurant = async (req, res) => {
  try {
    const foods = await Food.find({
      restaurant: req.params.restaurantId,
      // isAvailable: true, // ❌ REMOVE
    });

    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};
