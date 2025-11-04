const nodemailer = require("nodemailer");

// Create transporter (supports Gmail or custom SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // Use true if port = 465
  auth: {
    user: process.env.SMTP_USER, // e.g., your Gmail or SMTP username
    pass: process.env.SMTP_PASS, // e.g., your Gmail App Password
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Mailer connection failed:", error.message);
  } else {
    console.log("Mailer ready to send emails");
  }
});

// Reusable function to send emails
const sendMail = async (to, subject, html, attachments = []) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"TrainLine Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`Email successfully sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }
};

module.exports = { 
  transporter,
   sendMail 
  };
