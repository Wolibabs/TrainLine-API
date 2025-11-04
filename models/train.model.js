const mongoose = require("mongoose");

const TrainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Lagos Express"
    },
    code: {
      type: String,
      required: true,
      unique: true, // e.g. "LX-01"
    },
    capacity: {
      type: Number,
      required: true,
    },
    cabins: [
      {
        type: {
          type: String,
          required: true, // e.g. "First Class"
        },
        seats: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Train", TrainSchema);
