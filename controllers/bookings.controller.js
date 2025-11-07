const Booking = require("../models/booking.model");
const redisClient = require("../config/redis");
const Train = require("../models/train.model");
const QRCode = require("qrcode");
const { bookSeat, cancelBooking } = require("../services/booking.service");


  //Book a TRAIN SEAT
 
 // we say locks the seat temporarily by Redis to avoid two people booking same seat
   //Checks MongoDB to make sure seat isn’t already booked
  //If available then creates booking record using bookSeat service
  //If seat taken suggests another available seat 
 
const createBooking = async (req, res) => {
  console.log("Body Received:", req.body);
  try {
    const userId = req.user.id;
    const { runId, cabinType, preferredSeat, passengerInfo } = req.body;

    
    if (!runId || !cabinType || !preferredSeat || !passengerInfo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Lock key for Redis prevents double booking of same seat
    const lockKey = `lock:seat:${runId}:${cabinType}:${preferredSeat}`;
    const lock = await redisClient.set(lockKey, "locked", { NX: true, PX: 5000 }); // lock for 5 sec

    if (!lock) {
      //  if another user is trying to book this seat at same time
      return res.status(409).json({ message: "Seat is being booked by another user." });
    }

    try {
      //  Check MongoDB to ensure seat isn’t already booked
      const existing = await Booking.findOne({ runId, cabinType, seatNumber: preferredSeat });
      if (existing) {
        //  Seat already booked Oya suggest next available one
        const bookedSeats = await Booking.find({ runId, cabinType }).select("seatNumber");
        const takenSeats = bookedSeats.map((b) => b.seatNumber);
        const totalSeats = 40; // default cabin capacity
        const allSeats = Array.from({ length: totalSeats }, (_, i) => `A${i + 1}`);
        const availableSeat = allSeats.find((s) => !takenSeats.includes(s));

        return res.status(400).json({
          message: `Seat ${preferredSeat} is already booked.`,
          suggestion: availableSeat ? `Try seat ${availableSeat}` : "Cabin full",
        });
      }

      // If seat is free — proceed to create booking
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
    } finally {
      //  Always release the Redis lock even if error occurs
      await redisClient.del(lockKey);
    }
  } catch (outerError) {
    console.error("Outer booking error:", outerError);
    res.status(500).json({ message: "Internal server error" });
  }
};

 
 //Get my bookings fetch all bookings belonging to a logged in user, along with train run details (route, date, time).

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate("runId", "route date departureTime arrivalTime")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

 // cancel my booking User can cancel only their own booking, Only within 1 minute after creation.
 

const cancelMyBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    //  Find booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    //  Ensure booking belongs to the logged-in user
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
    }

    // Prevent double cancellation
    if (booking.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Booking already cancelled" });
    }

    // Check 1-minute cancellation window
    const createdAt = new Date(booking.createdAt);
    const now = new Date();
    const diffMinutes = (now - createdAt) / (1000 * 60);

    if (diffMinutes > 1) {
      return res.status(400).json({
        success: false,
        message: "Cancellation period expired (only allowed within 1 minute of booking)",
      });
    }

    // Proceed to cancel
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
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


 
 // Get booking by id fetch booking details and generate a QR Code for check in scanning
 
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Find booking and include route details
    const booking = await Booking.findById(bookingId).populate(
      "runId",
      "route date departureTime arrivalTime"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    //  Generate a QR code for this booking contains essential informatin
    const barcodeData = `BookingID: ${booking.bookingId}, Seat: ${booking.seatNumber}, Route: ${
      booking.runId?.route?.from || "N/A"
    } → ${booking.runId?.route?.to || "N/A"}`;

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
