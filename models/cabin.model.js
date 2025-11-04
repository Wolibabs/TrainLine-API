/**
 * Cabin model - optional separate collection if you want to store cabin instances
 * This is designed to represent cabin instances per run if you prefer separation.
 * If you prefer embed in trainRun, you can ignore this model.
 */

const mongoose = require('mongoose');

const CabinSchema = new mongoose.Schema({
  runId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'TrainRun', 
     required: true 
    },
  cabinId: { 
    type: String,
     required: true
     },   // e.g. 'A'
  cabinType: { 
    type: String,
     required: true 
    }, // e.g. 'first'
  seatsCount: { 
    type: Number,
     required: true, 
     min: 1 
    }
}, { timestamps: true });

// Unique cabin per run
CabinSchema.index({ runId: 1, cabinId: 1 }, { unique: true });

module.exports = mongoose.model('Cabin', CabinSchema);
