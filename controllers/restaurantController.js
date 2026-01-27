import Restaurant from "../models/Restaurant.js";

export const getPublicRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.aggregate([
      {
        $lookup: {
          from: "foods",
          localField: "_id",
          foreignField: "restaurant",
          as: "foods",
        },
      },
      {
        $addFields: {
          rating: {
            $ifNull: [{ $avg: "$foods.rating" }, 0],
          },
          reviewCount: { $sum: "$foods.reviews" },
          image: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$image", null] },
                  { $eq: ["$image", ""] }
                ]
              },
              then: "https://via.placeholder.com/400",
              else: "$image"
            }
          },
          id: "$_id"
        },
      },
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

export const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "No restaurant found" });
    }

    res.json(restaurant);
  } catch (err) {
    console.error("Get My Restaurant Error:", err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

export const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "No restaurant found" });
    }

    const {
      name,
      cuisine,
      description,
      deliveryTime,
      address,
      dietaryType,
    } = req.body;

    restaurant.name = name ?? restaurant.name;
    restaurant.cuisine = cuisine ?? restaurant.cuisine;
    restaurant.description = description ?? restaurant.description;
    restaurant.deliveryTime = deliveryTime ?? restaurant.deliveryTime;
    restaurant.address = address ?? restaurant.address;
    restaurant.dietaryType = dietaryType ?? restaurant.dietaryType;

    if (req.file) {
      restaurant.image = req.file.path;
    }

    await restaurant.save();

    res.json(restaurant);
  } catch (err) {
    console.error("Update My Restaurant Error:", err);
    res.status(500).json({ message: "Failed to update restaurant" });
  }
};
