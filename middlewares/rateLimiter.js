const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
  headers: true,
});

module.exports = limiter;
