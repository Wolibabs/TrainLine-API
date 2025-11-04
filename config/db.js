const mongoose = require('mongoose');
const createAdmin = require ('./createAdmin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,);
    console.log('MongoDB connected');
    // run the admin seeder once, if not already existing
    await createAdmin();

    console.log("Admin seeding checked completed");
    console.log('Remember: Transactions require replica set. Run `rs.initiate()` in Mongo shell.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
