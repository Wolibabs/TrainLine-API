const express = require('express');
const mongoose = require('mongoose');
//const {createClient} = require('redis');
const nodemailer = require('nodemailer')
const QRCode = require('qrcode');
const bcrypt = require("bcrypt");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const jwt = require ("jsonwebtoken");
const {v4: uuidv4 } =  require("uuid");
const dotenv = require  ('dotenv');

const  connectDB = require ('./config/db');
//const {initRedis} = require ('./config/redis');
const {testRedis} = require ('./config/redis');

const userRoutes = require("./routes/users.routes")
const authRoutes = require ('./routes/auth.routes');
const trainsRoutes = require ('./routes/trains.routes');
const bookingsRoutes = require ('./routes/bookings.routes');
const adminRoutes = require ('./routes/admin.routes');
const routeRoutes = require('./routes/route.routes');


dotenv.config();
connectDB();

(async () => {
  await testRedis();
})();


//(async () => {
  //try {
    //await initRedis(); 
    //console.log('Redis initialized successfully');
  //} catch (error) {
    //console.error('Redis initialization failed:', error.message);
  //}
//})();



uuidv4();
nodemailer;
bcrypt;
QRCode;
jwt;    

const app = express();


//  Middlewares 
app.use(express.json());
app.use(cors());
app.use(helmet());


// Rate Limiter will help you stop people from sending too many requests
const rateLimiter = rateLimit({
  windowMs: 15* 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 mins
  message: 'Too many requests from this IP, please try again later!',
});
app.use(rateLimiter);



app.use('/api/auth', authRoutes);
app.use('/api/trains', trainsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/routes", routeRoutes);




app.get('/', (req, res) => {
  res.send('Welcome to trainLine');
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;


