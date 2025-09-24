import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  token: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["waiting", "in-progress", "completed"],
    default: "waiting",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Appointment", appointmentSchema);
