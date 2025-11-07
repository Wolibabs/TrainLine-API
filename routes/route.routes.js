const express = require("express");
const { getAllRoutes, getAllStations } = require("../controllers/route.controller");
const router = express.Router();

// Get all routes
router.get("/", getAllRoutes);

//  Get all stations (add this line)
router.get("/stations", getAllStations);

module.exports = router;
