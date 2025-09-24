import express from "express";
import Appointment from "../models/Appointment.js";
import { protect } from "../middleware/authMiddleware.js";
import transporter from "../config/nodemailer.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Book Appointment (Patient)
 * Route: POST /api/appointments/book
 */
router.post("/book", protect, async (req, res) => {
  try {
    console.log("=== BOOKING REQUEST ===");
    console.log("User:", req.user);
    console.log("Request body:", req.body);
    
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      console.log("Missing required fields:", { doctorId, date });
      return res.status(400).json({ error: "DoctorId and Date are required" });
    }

    // Check if doctor exists
    const doctorExists = await User.findById(doctorId);
    if (!doctorExists) {
      console.log("Doctor not found:", doctorId);
      return res.status(404).json({ error: "Doctor not found" });
    }
    console.log("Doctor found:", doctorExists.name);

    // Normalize date to only YYYY-MM-DD (ignore time)
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Find last token for this doctor on this date
    const lastAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
    }).sort({ token: -1 });

    const nextToken = lastAppointment ? lastAppointment.token + 1 : 1;

    // Create new appointment
    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: appointmentDate,
      token: nextToken,
      status: "waiting",
    });

    await appointment.save();
    console.log("Appointment saved successfully:", appointment._id);

    // -------------------- SEND EMAIL (OPTIONAL) --------------------
    let emailSent = false;
    try {
      const patient = await User.findById(req.user.id);
      const doctor = await User.findById(doctorId);

      // Estimate time (example: each token = 15 min)
      const estimatedTime = new Date(appointmentDate);
      estimatedTime.setHours(9, 0, 0); // Start at 9:00 AM
      estimatedTime.setMinutes(estimatedTime.getMinutes() + (nextToken - 1) * 15);

      await transporter.sendMail({
        from: `"Hospital Appointment" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: "Your Appointment is Confirmed",
        text: `Hello,

Your appointment is confirmed!
Doctor: ${doctor.name}
Date: ${appointmentDate.toDateString()}
Token Number: ${nextToken}
Approx Time: ${estimatedTime.toTimeString().slice(0,5)}

Thank you.`,
      });
      
      emailSent = true;
      console.log("Email sent successfully to:", patient.email);
    } catch (emailError) {
      console.error("Email sending failed (but appointment was created):", emailError.message);
      // Don't throw error - appointment was created successfully
    }

    res.json({
      message: "Appointment booked successfully & email sent",
      appointment: {
        id: appointment._id,
        token: appointment.token,
        date: appointment.date,
        status: appointment.status,
      },
    });
  } catch (err) {
    console.error("=== BOOKING ERROR ===");
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

/**
 *  Get My Appointments (Patient)
 */
router.get("/my-appointments", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name email")
      .sort({ date: 1, token: 1 });

    res.json(appointments);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

/**
 *  Get Doctor's Appointments (Doctor)
 */
router.get("/doctor-appointments", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Doctors only." });
    }

    const appointments = await Appointment.find({ doctor: req.user.id })
      .populate("patient", "name email")
      .sort({ date: 1, token: 1 });

    res.json(appointments);
  } catch (err) {
    console.error("Doctor fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch doctor's appointments" });
  }
});
// Update Appointment Status
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Doctors only." });
    }

    const appointment = await Appointment.findById(req.params.id).populate(
      "patient",
      "name email"
    );
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const { status } = req.body; // expecting: "waiting", "in-progress", "completed"

    appointment.status = status;
    await appointment.save();

    // -------------------- SEND EMAIL --------------------
    // -------------------- SEND EMAIL --------------------
const patient = appointment.patient;

// Fetch doctor info from DB
const doctor = await User.findById(req.user.id); // now you get name and email

await transporter.sendMail({
  from: `"Hospital Appointment" <${process.env.EMAIL_USER}>`,
  to: patient.email,
  subject: "Appointment Status Updated",
  text: `Hello ${patient.name},

Your appointment with Dr. ${doctor.name} on ${appointment.date.toDateString()} 
(token #${appointment.token}) has been updated.

Current Status: ${status.toUpperCase()}

Thank you.`,
});



    res.json({ message: "Status updated & email sent", appointment });
  } catch (err) {
    console.error("Update status error:", err.message);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/**
 * 📌 Get Doctor Dashboard
 * Route: GET /api/appointments/dashboard
 * Query params (optional):
 *   date=YYYY-MM-DD
 *   status=waiting | in-progress | completed
 */
router.get("/dashboard", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Doctors only." });
    }

    const { date, status } = req.query;

    // Build query dynamically
    const query = { doctor: req.user.id };

    if (status) query.status = status;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "name email") // show patient info
      .sort({ date: 1, token: 1 }); // sort by date then token

    res.json({ appointments });
  } catch (err) {
    console.error("Dashboard fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});




export default router;
