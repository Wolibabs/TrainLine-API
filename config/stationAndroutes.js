const Station = require("../models/station.model");
const Route = require("../models/route.model");

const seedStationsAndRoutes = async () => {
  try {
    const existingStations = await Station.find();
    if (existingStations.length > 0) {
      console.log(" Stations already exist, skipping seeding.");
      return;
    }

    // otherwise seed new ones
    const stations = await Station.insertMany([
      { name: "Abeokuta" },
      { name: "Otta" },
      { name: "Ebute Metta" },
    ]);

    const routes = await Route.insertMany([
      { from: "Abeokuta", to: "Otta" },
      { from: "Otta", to: "Ebute Metta" },
    ]);

    console.log("Stations and routes seeded successfully!");
  } catch (error) {
    console.error("Error seeding stations and routes:", error);
  }
};

module.exports = seedStationsAndRoutes;
