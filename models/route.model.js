const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    origin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },

    distanceKm: Number,
    estimatedDuration: String, // e.g. "1h 20m"
    active: { type: Boolean, default: true },
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);
