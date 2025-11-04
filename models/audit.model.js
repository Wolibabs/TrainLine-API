/**
 * AuditLog model
 * Stores events for bookings and seat changes.
 * type: event type string
 * payload: arbitrary JSON of event details
 * userId: who triggered the event (if any)
 */

const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true
 }, // 'booking-created', 'booking-cancelled', ...

  payload: { 
    type: mongoose.Schema.Types.Mixed 
},
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     default: null
     },

  runId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'TrainRun', 
     default: null
     },

  bookingId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for common lookups
AuditSchema.index({ type: 1, createdAt: -1 });
AuditSchema.index({ userId: 1 });

module.exports = mongoose.model('Audit', AuditSchema);
