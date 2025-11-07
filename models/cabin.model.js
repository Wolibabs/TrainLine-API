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

// Unique index to prevent duplicate cabins in the same train run, it also helps us tell Monogodb hw to find data faster and avoid duplicate 
CabinSchema.index({ runId: 1, cabinId: 1 }, { unique: true });

module.exports = mongoose.model('Cabin', CabinSchema);
