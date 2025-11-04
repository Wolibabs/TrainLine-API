const mongoose = require("mongoose");
const Booking = require("../models/booking.model");
const TrainRun = require("../models/trainRun.model");
const generateBarcode = require("../utils/barcode");
const { publishEmailEvent } = require("./email.service");

// BOOK A TRAIN SEAT
const bookSeat = async (userId, runId, cabinType, seatNumber, passengerInfo, userEmail) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the train run
    const trainRun = await TrainRun.findById(runId).session(session);
    if (!trainRun) throw new Error("Train run not found");

    // Find the correct cabin
    const cabin = trainRun.cabins.find((c) => c.type === cabinType);
    if (!cabin) throw new Error("Cabin type not found");

    // Check seat availability
    if (cabin.available <= 0) throw new Error("No available seats in this cabin");

    // Check if the seat is already booked
    const existingBooking = await Booking.findOne({ runId, seatNumber }).session(session);
    if (existingBooking) throw new Error("Seat already booked");

    // Generate unique ticket code and QR code
    const ticketCode = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const qrCode = await generateBarcode(ticketCode);

    // Reduce available seats in the cabin
    cabin.available -= 1;

    // Create booking
    const booking = new Booking({
      userId,
      runId,
      seatNumber,
      cabinType,
      passengerInfo,
      ticketCode,
      qrCode,
      status: "confirmed",
    });

    await booking.save({ session });
    await trainRun.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Send ticket email (async)
    await publishEmailEvent("ticket:created", {
      email: userEmail,
      ticketCode,
      qrCode,
      seatNumber,
      cabinType,
      trainRun,
    });

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// CANCEL BOOKING
const cancelBooking = async (userId, bookingId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({ _id: bookingId, userId }).session(session);
    if (!booking) throw new Error("Booking not found or unauthorized");

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;

    await booking.save({ session });
    await session.commitTransaction();
    session.endSession();

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = { bookSeat, cancelBooking };
