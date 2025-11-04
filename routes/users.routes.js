const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { getMyProfile, getAllUsers, getActiveUsers } = require("../controllers/users.controller");

// Route: GET /api/users/me
// For normal users to view their own profile
router.get("/me", auth, getMyProfile);

// Route: GET /api/users
// For admin to list all users
router.get("/", auth, isAdmin, getAllUsers);

// Route: GET /api/users/active
// For admin to list active users only
router.get("/active", auth, isAdmin, getActiveUsers);

module.exports = router;
