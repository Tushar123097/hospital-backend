const Appointment = require("../models/Appointment");

//  Patient: Get my appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name email")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

module.exports = { getMyAppointments };
