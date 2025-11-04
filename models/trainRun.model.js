/**
 * TrainRun model
 * Represents a single train's scheduled run for a specific date.
 * Example: Lagos Express from Ibadan → Abeokuta on 2025-11-05 at 08:00
 */

const mongoose = require("mongoose");

// Sub-schema for cabin information
const cabinSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true, // e.g. "First Class", "Economy"
      trim: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    available: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Sub-schema for route details
const routeSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

// Main TrainRun schema
const trainRunSchema = new mongoose.Schema(
  {
    trainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },

    route: {
      type: routeSchema,
      required: true,
    },

    date: {
      type: String,
      required: true, // Format: YYYY-MM-DD
    },

    departureTime: {
      type: String,
      required: true, // e.g. "08:00"
    },

    arrivalTime: {
      type: String,
      required: true, // e.g. "11:00"
    },

    cabins: {
      type: [cabinSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Compound index for quick lookups by route and date
trainRunSchema.index({ "route.from": 1, "route.to": 1, date: 1 });

module.exports = mongoose.model("TrainRun", trainRunSchema);
