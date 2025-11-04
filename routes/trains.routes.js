const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const {
  createTrain,
  getAllTrains,
  getTrainById,
  updateTrain,
  deleteTrain,
  getTrainRuns,
} = require("../controllers/trains.controller");
const { route } = require("./users.routes");

// Route: POST /api/trains (Admin Only)
router.post("/", auth, isAdmin, createTrain);

// Route: GET /api/trains (Public)
router.get("/", getAllTrains);

// Route: GET /api/trains/runs (Public)
router.get("/runs", getTrainRuns);

// Route: GET /api/trains/:id (Public)
router.get("/:id", getTrainById);

// Route: PUT /api/trains/:id (Admin Only)
router.put("/:id", auth, isAdmin, updateTrain);

// Route: DELETE /api/trains/:id (Admin Only)
router.delete("/:id", auth, isAdmin, deleteTrain);

module.exports = router;
