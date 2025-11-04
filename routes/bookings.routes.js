const express = require("express");
const router = express.Router();
//const {verifyToken} = require("../middlewares/auth");
const auth = require("../middlewares/auth");
const {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getBookingById,
} = require("../controllers/bookings.controller");


// User books a seat
router.post("/", auth, createBooking);

// Get user bookings
router.get("/", auth, getMyBookings);

// Get single booking by ID (includes barcode)
router.get("/:id", auth, getBookingById); 

// Cancel a booking
router.put("/:bookingId/cancel", auth, cancelMyBooking);

module.exports = router;
