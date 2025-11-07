const mongoose = require('mongoose');
const createAdmin = require ('./createAdmin');
const seedStationsAndRoutes = require ('./stationAndroutes');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,);
    console.log('MongoDB connected');
    // run the admin seeder once, create if not already existing
    await createAdmin();
    // Seed stations and routes
      await seedStationsAndRoutes();
    console.log("Admin and Stations data checked/seeded successfully");
    console.log('Remember: Transactions require replica set. Run `rs.initiate()` in Mongo shell.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
