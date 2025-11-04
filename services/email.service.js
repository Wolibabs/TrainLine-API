const nodemailer = require("nodemailer");
const { sendMail } = require("../config/mailer");
const Redis = require("ioredis");
const QRCode = require("qrcode");

// Create Redis clients for pub/sub
const redisPublisher = new Redis(process.env.REDIS_URL);
const redisSubscriber = new Redis(process.env.REDIS_URL);

// Function to publish email events
const publishEmailEvent = async (event, payload) => {
  try {
    await redisPublisher.publish(event, JSON.stringify(payload));
    console.log(`Published email event: ${event}`);
  } catch (err) {
    console.error("Redis publish error:", err.message);
  }
};

// Function to send booking confirmation email immediately
const sendBookingEmail = async ({ email, ticketCode, seatNumber, cabinClass, trainId, qrCode }) => {
  const subject = `Your TrainLine Ticket Confirmation - ${ticketCode}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>TrainLine Ticket Confirmation</h2>
      <p>Dear Passenger,</p>
      <p>Your booking has been confirmed successfully.</p>
      <p><strong>Ticket Code:</strong> ${ticketCode}</p>
      <p><strong>Train ID:</strong> ${trainId}</p>
      <p><strong>Cabin:</strong> ${cabinClass}</p>
      <p><strong>Seat:</strong> ${seatNumber}</p>
      <p><img src="${qrCode}" alt="QR Code" style="width:150px;"/></p>
      <p>Thank you for choosing TrainLine!</p>
    </div>
  `;

  try {
    await sendMail(email, subject, html);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

//  Redis Subscriber to handle async email sending
redisSubscriber.subscribe("ticket:created", (err, count) => {
  if (err) console.error("Redis subscribe error:", err.message);
  else console.log("Subscribed to ticket:created event");
});

redisSubscriber.on("message", async (channel, message) => {
  if (channel === "ticket:created") {
    const data = JSON.parse(message);
    console.log("Received ticket:created event:", data);

    try {
      // If QR code not provided, generate one
      const qrCode = data.qrCode || (await QRCode.toDataURL(data.ticketCode));

      await sendBookingEmail({
        email: data.email,
        ticketCode: data.ticketCode,
        seatNumber: data.seatNumber,
        cabinClass: data.cabinClass,
        trainId: data.trainId,
        qrCode,
      });
    } catch (err) {
      console.error("Worker email handling failed:", err.message);
    }
  }
});



const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};


module.exports = { publishEmailEvent, sendBookingEmail, sendEmail };
