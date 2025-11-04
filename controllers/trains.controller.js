const { get } = require("mongoose");
const Train = require("../models/train.model");
const TrainRun = require("../models/trainRun.model");

// CREATE A NEW TRAIN (Admin Only)
const createTrain = async (req, res) => {
  try {
    const { name, from, to, departureTime, arrivalTime, price, cabins } = req.body;

    if (!name || !from || !to || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTrain = new Train({
      name,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      cabins: cabins || [],
    });

    await newTrain.save();
    res.status(201).json({
      message: "Train created successfully",
      train: newTrain,
    });
  } catch (error) {
    console.error("Create train error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET ALL TRAINS
const getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    res.json({
      total: trains.length,
      trains,
    });
  } catch (error) {
    console.error("Get trains error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ONE TRAIN BY ID
const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) return res.status(404).json({ message: "Train not found" });

    res.json(train);
  } catch (error) {
    console.error("Get train by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE TRAIN DETAILS (Admin Only)
const updateTrain = async (req, res) => {
  try {
    const updated = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Train not found" });

    res.json({
      message: "Train updated successfully",
      train: updated,
    });
  } catch (error) {
    console.error("Update train error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE A TRAIN (Admin Only)
const deleteTrain = async (req, res) => {
  try {
    const deleted = await Train.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Train not found" });

    res.json({ message: "Train deleted successfully" });
  } catch (error) {
    console.error("Delete train error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ GET /api/trains/runs?date=YYYY-MM-DD&route=ibadan-abeokuta
const getTrainRuns = async (req, res) => {
  try {
    const { date, route } = req.query;

    if (!date || !route) {
      return res.status(400).json({ message: "date and route are required" });
    }

    const [from, to] = route.split("-");
    const runs = await TrainRun.find({
      "route.from": from.toLowerCase(),
      "route.to": to.toLowerCase(),
      date,
    }).populate("trainId", "name number"); // optional populate train info

    if (runs.length === 0) {
      return res.status(404).json({ message: "No train runs found for this route and date" });
    }

    res.json({
      total: runs.length,
      runs,
    });
  } catch (error) {
    console.error("Get train runs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  createTrain,
  getAllTrains,
  getTrainById,
  updateTrain,
  deleteTrain,
  getTrainRuns,

};
