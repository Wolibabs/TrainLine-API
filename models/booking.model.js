/**
 * Booking model
 * bookingId: user-facing uuid (string)
 * status: 'confirmed'|'cancelled'|'held'
 * passengerInfo: object carrying passenger details (name, phone, email, etc)
 *
 * createdAt will be used to enforce the 1-minute cancellation window for users.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  bookingId: {
     type: String,
      default: () => uuidv4(),
       unique: true 
    },

    train: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "Train",
         required: true
         },

  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true 
    },

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
     },

  passengerInfo: {
     type: mongoose.Schema.Types.Mixed, 
     default: {} 
    },

  status: {
     type: String, 
     enum: ['confirmed', 'cancelled', 'held'],
      default: 'confirmed'
     },

  cancelledAt: {
     type: Date,
     default: null 
    },

  cancelledBy: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', default: null
     },

  meta: { 
    type: mongoose.Schema.Types.Mixed,
     default: {}
     }
     
}, {
  timestamps: { createdAt: true, updatedAt: true }
});


// Ensure no duplicate seat per train

// Indexes for queries
BookingSchema.index({ runId: 1, createdAt: 1 });
//BookingSchema.index({ bookingId: 1, train: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
