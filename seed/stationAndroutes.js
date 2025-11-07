const Station = require("../models/station.model");
const Route = require("../models/route.model");

const seedStationsAndRoutes = async () => {
    
  const stationsData = ["Abeokuta", "Otta", "Ebute Metta"];

  const stations = await Station.insertMany(
    stationsData.map((name) => ({ name }))
  );

  const [abeokuta, otta, ebute] = stations;

  await Route.insertMany([
    { origin: abeokuta._id, destination: otta._id, distanceKm: 70, estimatedDuration: "1h 15m" },
    { origin: otta._id, destination: ebute._id, distanceKm: 45, estimatedDuration: "1h 00m" },
  ]);

  console.log("Stations & Routes seeded successfully");
};

module.exports = seedStationsAndRoutes;
