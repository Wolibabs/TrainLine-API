const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
require("dotenv").config();

//create the default admin user only once
//if the admin already exists, do not create again
const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhone = process.env.ADMIN_PHONE;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword) {
        console.log("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file");
        return;
    }
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });


    if (existingAdmin) {
      console.log("Admin already exists", existingAdmin.email);
      return; //stop dont recreate
    }
    //  hash the default password
    //const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create new admin user
    const admin = new User({
      fullName: adminName,
      email: adminEmail,
      password: adminPassword,
      phoneNumber: adminPhone,
      role: "admin",
      isActive: true,
    });

    await admin.save();

    console.log("Admin user created successfully:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
  } catch (error) {
    console.error("Error creating admin:", error.message);
  
  }
};

module.exports = createAdmin;