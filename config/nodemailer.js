import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Ensure environment variables are loaded before creating the transporter
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transporter;

// Optional: verify connection configuration at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer verify failed:", error.message);
  } else {
    console.log("Nodemailer is ready to send emails as", process.env.EMAIL_USER);
  }
});
