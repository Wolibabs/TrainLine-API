const User = require("../models/user.model");
// GET CURRENT LOGGED-IN USER PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = req.user; // already attached from auth middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN: GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    //exclude password
    const users = await User.find().select ("-password"); 
    res.json({
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN: GET ONLY ACTIVE USERS
const getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select( "-password -passwordHash");
    res.json({
      total: users.length, users
    });
  } catch (error) {
    console.error("Get active users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyProfile,
  getAllUsers,
  getActiveUsers,
};
