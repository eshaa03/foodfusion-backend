import Restaurant from "../models/Restaurant.js";

export const getPublicRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.aggregate([
      // 1. Join with Foods
      {
        $lookup: {
          from: "foods",
          localField: "_id",
          foreignField: "restaurant",
          as: "foods",
        },
      },
      // 2. Add Rating & Clean Up
      {
        $addFields: {
          rating: {
            $ifNull: [{ $avg: "$foods.rating" }, 0], // Calc avg from food ratings
          },
          reviewCount: { $sum: "$foods.reviews" }, // Optional: sum of reviews
          image: { $ifNull: ["$image", "https://via.placeholder.com/400"] }, // Ensure image exists
          id: "$_id" // Frontend expects id
        },
      },
      // 3. Project only needed fields (remove huge foods array)
      {
        $project: {
          foods: 0,
          __v: 0,
        },
      },
    ]);

    res.json(restaurants);
  } catch (err) {
    console.error("Get Restaurants Error:", err);
    res.status(500).json({ message: "Failed to fetch restaurants", error: err.message });
  }
};
