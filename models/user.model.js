const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
     validate: {
        validator: function (v) {
          //  email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
  },


  password: {
    type: String,
    required: true,
    select: false, // exclude password 
  },

  phoneNumber: {
    type: String,
    require:[true, "Phone number is required"],
     validate: {
        validator: function (v) {
          // Must be exactly 11 digits only
          return /^(\d{11})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 11-digit phone number!`,
      },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
      transform(doc, ret) {
        delete ret.password; //  remove password field
        delete ret.__v; //  remove version field
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);



//  Automatically hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
