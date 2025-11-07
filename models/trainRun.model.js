const { required } = require("joi");
const mongoose = require("mongoose");

// Sub-schema for cabin information
const cabinSchema = new mongoose.Schema(
  {
    cabinId: {
    type: String,
      required: true, // e.g. "First Class", "Economy"
      trim: true,
    },

    cabinType: {
      type: String,
      required: true, // e.g. "first clss", "economy"
      trim: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
      default: 40,
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
      type: Date,
      required: true, // Format: YYYY-MM-DD
    },

    session: {
      type: String,
      enum: ["morning", "afternoon"],
      required: true,
    },

    departureTime: {
      type: String,
      required: true, // e.g. "08:00"
    },

    arrivalTime: {
      type: String,
      required: true, // e.g. "11:00"
    },

    cabins: [cabinSchema],
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },

      },

  { timestamps: true }
);

// Compound index for quick lookups by route and date
trainRunSchema.index({ "route.from": 1, "route.to": 1, date: 1 });

module.exports = mongoose.model("TrainRun", trainRunSchema);
