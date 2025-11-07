const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// REGISTER A NEW USER
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    
    
    //create new user
    const newUser =new User({
      fullName,
       email,
        password,
        phoneNumber,
       role: "user",//default role is user
    });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  }catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Internal server error" });
    }

  };
    // Hash password
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    //const newUser = await User.create({
      //fullName,
      //email,
      //password: hashedPassword,
      //role: "user",
    //});

    //res.status(201).json({
      //message: "User registered successfully",
      //user: {
        //id: newUser._id,
        //fullName: newUser.fullName,
        //email: newUser.email,
      //},
    //});
  //} catch (error) {
    //console.error("Register error:", error);
    //res.status(500).json({ message: "Internal server error" });
  //}
//};


// Login an existing user

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("No user found for:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("Found user:", user.fullName, "Role:", user.role);
    console.log("User password in DB:", user.password);
console.log("Entered password:", password);

    // Compare password
    console.log("User record passwrod in DB:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login
};