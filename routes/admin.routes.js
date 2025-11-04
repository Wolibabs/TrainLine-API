const express = require("express");
const router = express.Router();

// Import middlewares 
const authMiddleware = require("../middlewares/auth");
//const adminAuth = require("../middlewares/adminAuth");
const { verifyAdmin, authorize } = require("../middlewares/adminAuth");
//const {verifyToken, isAdmin} = require("../middlewares/adminAuth");


// Import controllers
const {
  getAllUsers,
  getActiveUsers,
  getAllBookings,
  getRidersOverview,
  createTrain,
  cancelBookingByAdmin,
  sendNotification,
} = require("../controllers/admin.controller");

//  Protect all admin routes
router.use(authMiddleware);
//router.use(authMiddleware, adminAuth);


// Users
router.get("/users", verifyAdmin, getAllUsers);
router.get("/users/active", verifyAdmin, getActiveUsers);

// Bookings & Trains
router.get("/bookings", verifyAdmin, getAllBookings);
router.get("/riders-overview", verifyAdmin, getRidersOverview);
router.post("/train", verifyAdmin, createTrain);
router.post("/bookings/:id/cancel", verifyAdmin, cancelBookingByAdmin);

//  Notifications
router.post("/notify", verifyAdmin, authorize("admin"), sendNotification);

module.exports = router;
