const redis = require("redis");
const transporter = require("../config/mailer");
require("dotenv").config();

// Redis Subscriber
const subscriber = redis.createClient({
  url: process.env.REDIS_URL,
});

subscriber.on("error", (err) => console.error("Redis error:", err));
subscriber.connect();

(async () => {
  await subscriber.subscribe("email_notifications", async (message) => {
    try {
      console.log(" New email job received:", message);

      const data = JSON.parse(message);
      const { to, subject, html, attachments } = data;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        attachments: attachments || [],
      });

      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error("Failed to send email:", error.message);
    }
  });
})();
