/**
 * Seat model
 * Each seat belongs to a run (runId) and a cabinType and has a seatNumber.
 * Unique index on (runId, cabinType, seatNumber) prevents duplicates at DB level.
 *
 * status: 'available' | 'held' | 'booked'
 * heldUntil: Date for temporary holds (optional)
 * bookingId: ObjectId reference when booked
 */

const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  runId: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainRun', 
      required: true 
    },

  cabinType: { 
    type: String,
     required: true
     },

  seatNumber: {
     type: String,
      required: true
     }, // e.g. '1A' or '12'

  status: {
     type: String,
      enum: ['available', 'held', 'booked'], 
      default: 'available'
     },
  heldUntil: { 
    type: Date, 
    default: null
 },

  bookingId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Booking',
      default: null 
    }
    
}, {
  timestamps: true
});

// Unique seat per run + cabin + seatNumber
SeatSchema.index({ runId: 1, cabinType: 1, seatNumber: 1 }, { unique: true });

// Index for quick querying of available seats in a run/cabin
SeatSchema.index({ runId: 1, cabinType: 1, status: 1 });

module.exports = mongoose.model('Seat', SeatSchema);
