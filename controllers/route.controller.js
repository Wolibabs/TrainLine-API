const Route = require("../models/route.model");
const Station = require("../models/station.model");

// Get all route
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate("origin destination", "name");
    res.json(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get all stations
const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json({ total: stations.length, stations });
  } catch (err) {
    console.error("Error fetching stations:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllRoutes, getAllStations };
