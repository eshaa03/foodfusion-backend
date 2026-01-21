import User from "../models/User.js";

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json(req.user);
};
export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { _id, ...newAddress } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (_id) {
      // UPDATE existing address
      const existingAddress = user.addresses.id(_id);
      if (existingAddress) {
        Object.assign(existingAddress, newAddress);
      } else {
        return res.status(404).json({ message: "Address not found" });
      }
    } else {
      // ADD new address
      // If first address -> make it default
      if (user.addresses.length === 0) {
        newAddress.isDefault = true;
      }
      user.addresses.push(newAddress);
    }

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error("Add/Update address error:", err);
    res.status(500).json({ message: "Failed to save address" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: "Failed to delete address" });
  }
};


export const toggleFavorite = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = req.user;

    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    if (user.favorites.includes(itemId)) {
      user.favorites = user.favorites.filter(id => id !== itemId);
    } else {
      user.favorites.push(itemId);
    }

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    console.error("toggleFavorite error:", err);
    res.status(500).json({ message: "Failed to toggle favorite" });
  }
};




export const getFavorites = (req, res) => {
  res.json(req.user.favorites || []);
};

export const getRedeemPoints = async (req, res) => {
  res.json({ points: req.user.redeemPoints });
};

export const redeemPoints = async (req, res) => {
  const { points } = req.body;

  if (points > req.user.redeemPoints) {
    return res.status(400).json({ message: "Not enough points" });
  }

  req.user.redeemPoints -= points;
  await req.user.save();

  res.json({
    remainingPoints: req.user.redeemPoints,
    discount: points,
  });
};
