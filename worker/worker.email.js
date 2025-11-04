const Redis = require("ioredis");
const { sendMail } = require("../config/mailer");
const QRCode = require("qrcode");

const redisSubscriber = new Redis(process.env.REDIS_URL);

console.log("Email worker started and waiting for Redis events...");

// Subscribe to ticket events
redisSubscriber.subscribe("ticket:created", "ticket:cancelled", (err, count) => {
  if (err) {
    console.error("Redis subscribe error:", err.message);
  } else {
    console.log(`Email worker subscribed to ${count} channels`);
  }
});

// Handle incoming messages
redisSubscriber.on("message", async (channel, message) => {
  const data = JSON.parse(message);
  console.log(`Received event on ${channel}:`, data);

  try {
    if (channel === "ticket:created") {
      // Generate QR Code if not provided
      const qrCode = data.qrCode || (await QRCode.toDataURL(data.ticketCode));

      const subject = `TrainLine Ticket Confirmation - ${data.ticketCode}`;
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>TrainLine Ticket Confirmation</h2>
          <p>Dear Passenger,</p>
          <p>Your booking has been successfully confirmed.</p>
          <p><strong>Ticket Code:</strong> ${data.ticketCode}</p>
          <p><strong>Train ID:</strong> ${data.trainId}</p>
          <p><strong>Cabin Class:</strong> ${data.cabinClass}</p>
          <p><strong>Seat Number:</strong> ${data.seatNumber}</p>
          <img src="${qrCode}" alt="QR Code" style="width:150px;"/>
          <p>Thank you for choosing <strong>TrainLine</strong>!</p>
        </div>
      `;

      await sendMail(data.email, subject, html);
      console.log(`Booking confirmation sent to ${data.email}`);
    }

    if (channel === "ticket:cancelled") {
      const subject = `TrainLine Booking Cancelled - ${data.ticketCode}`;
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>TrainLine Booking Cancelled</h2>
          <p>Dear Passenger,</p>
          <p>Your booking with ticket code <strong>${data.ticketCode}</strong> has been cancelled.</p>
          <p>If this was not you, please contact TrainLine support immediately.</p>
          <p>We hope to see you on another trip soon 🚆</p>
        </div>
      `;

      await sendMail(data.email, subject, html);
      console.log(`Cancellation email sent to ${data.email}`);
    }
  } catch (err) {
    console.error("Email worker error:", err.message);
  }
});
