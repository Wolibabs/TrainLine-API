const Booking = require("../models/booking.model");
const Train = require("../models/train.model");
const QRCode = require("qrcode");
const { bookSeat, cancelBooking } = require("../services/booking.service");

// BOOK A TRAIN SEAT
 
const createBooking = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  try {
    const userId = req.user.id;
    const { runId, cabinType, preferredSeat, passengerInfo } = req.body;

    if (!runId || !cabinType || !preferredSeat || !passengerInfo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = await bookSeat(
      userId, 
      runId,
      cabinType,
      preferredSeat,
      passengerInfo,
      req.user.email
    );

    return res.status(201).json({
      success: true,
      message: "Booking successful",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// GET ALL MY BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ userId }).populate("runId", "route date departureTime arrivalTime")
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success:false, message: "Internal server error" });
  }
};

// CANCEL BOOKING
const cancelMyBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if(!booking) {
      return res.status(404).json({success: false, message: "Booking not found" });
    }
      // Ensure the booking belongs to the user
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
    }
    //prevent cancelling already cancelled booking
    if(booking.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    //check if cancellation is within 1 min
    const creatAt = new Date(booking.createdAt);
    const now = new Date();
    const diffMinutes = (now - creatAt) / (1000 * 60);

    if(diffMinutes > 1) {
    return res.status(200).json({
      success: false,
      message: "Cancellation period has expired. Cancellations are only allowed within 1 minute of booking)",
    });
  }

  //proceed with cancellation
  booking.status = "Cancelled";
  booking.cancelledAt = now;
  booking.cancelledBy = userId;
  await booking.save();

  return res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
    booking,
  });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success:false, message: "Internal server error" });
  }
};

// GET BOOKING BY ID (includes QR/barcode)
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Find booking and include run info
    const booking = await Booking.findById(bookingId)
      .populate("runId", "route date departureTime arrivalTime");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Generate QR Code / Barcode data
    const barcodeData = `BookingID: ${booking.bookingId}, Seat: ${booking.seatNumber}, Route: ${booking.runId?.route || "N/A"}`;
    const barcodeURL = await QRCode.toDataURL(barcodeData);

    return res.status(200).json({
      success: true,
      booking,
      barcodeURL,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getBookingById,
};
