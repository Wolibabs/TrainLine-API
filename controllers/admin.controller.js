const User = require("../models/user.model");
const Train = require("../models/train.model");
const Booking = require("../models/booking.model");
const mongoose = require("mongoose");
const {sendEmail, publishEmailEvent} = require("../services/email.service");


// get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ total: users.length, users });
  } catch (err) { 
    console.error("Get users error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// get active user
const getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    res.json({ total: users.length, users });
  } catch (err) {
    console.error("Get active users error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// get riders overview Bookings by Route

const getRidersOverview = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: { route: "$trainId", cabinClass: "$cabinClass" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);
    res.json({ overview: stats });
  } catch (err) {
    console.error("Overview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET ALL BOOKINGS
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName email")
      .populate("trainId", "name from to departureTime");
    res.json({ total: bookings.length, bookings });
  } catch (error) {
    console.error("Admin get bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// CREATE TRAIN

const createTrain = async (req, res) => {
  try {
    const { name, from, to, departureTime, arrivalTime, cabins } = req.body;

    if (!name || !from || !to || !departureTime || !arrivalTime || !cabins) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const train = new Train({
      name,
      from,
      to,
      departureTime,
      arrivalTime,
      cabins,
      createdBy: req.user._id,
    });

    await train.save();
    res.status(201).json({
      message: "Train created successfully",
      train,
    });
  } catch (error) {
    console.error("Admin create train error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN CANCEL BOOKING

const cancelBookingByAdmin= async (req, res) => {

  try {
    const {id } = req.params;
//find booking
    const booking = await Booking.findById(id).populate("userId", "email fullName");
    if (!booking) {
      return res.status(404).json({ success:false, message: "Booking not found" });
    }
    //prevent double cancellation
    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking already cancelled" });
    }
    
    // Cancel booking immediately — admin override
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.id;
    await booking.save();
    

    // Send cancellation notification
    await publishEmailEvent("ticket:cancelled", {
      email: booking.userId.email,
      ticketCode: booking.bookingId,
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully by admin",
      booking,
    });
  } catch (err) {
    console.error("Admin cancel booking error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Send notification email

const sendNotification = async (req, res) => {
  try {
    const { userIds, subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and body are required" });
    }

    let recipients;
    
    if (userIds && userIds.length > 0) {
      recipients = await User.find({ _id: { $in: userIds } });
    } else {
      recipients = await User.find({isActive: true });
    }

    if (recipients.length === 0) {
      return res.status(404).json({ message: "No users found to notify" });
    }

    //send email to each recipient
    for (const user of recipients) {
      await sendEmail({
        to: user.email,
        subject,
         html: `<p>Dear ${user.fullName},</p><p>${body}</p><p>Best regards,<br>TrainLine Team</p>`,
      });
    }

    res.status(200).json({ 
      success: true,
      message: `Notifications sent to ${recipients.length} user(s)`,
    });
  } catch (err) {
    console.error("Notification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
  

module.exports = {
  getAllUsers,
  getActiveUsers,
  getRidersOverview,
  getAllBookings,
  createTrain,
  cancelBookingByAdmin,
  sendNotification,
};
