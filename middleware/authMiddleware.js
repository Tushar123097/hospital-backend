// const express = require("express");
// const Appointment = require("../models/Appointment");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get My Appointments (Patient)
// router.get("/my-appointments", authMiddleware, async (req, res) => {
//   try {
//     const appointments = await Appointment.find({ patient: req.user.id })
//       .populate("doctor", "name email specialization") // get doctor details
//       .sort({ date: -1 }); // latest first

//     res.json({ appointments });
//   } catch (err) {
//     console.error("Error fetching appointments:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id, email }
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
