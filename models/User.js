// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String, // Plain now (later we can hash it)
//   role: { type: String, enum: ["patient", "doctor"], default: "patient" }
// });

// module.exports = mongoose.model("User", userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Plain now (later we can hash it)
  role: { type: String, enum: ["patient", "doctor"], default: "patient" }
});

export default mongoose.model("User", userSchema);
