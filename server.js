// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const connectDB = require("./config/db");
// // const historyRoutes = require("./routes/historyRoutes");
// import userRoutes from "./routes/userRoutes.js";
// const authRoutes = require("./routes/authRoutes");

// const appointmentRoutes = require("./routes/appointmentRoutes");
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // DB Connection
// connectDB();

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/appointments", appointmentRoutes);
// // app.use("/api/appointments", historyRoutes);
// // app.use("/api/appointments", historyRoutes);


// // const userRoutes = require("./routes/userRoutes");
// app.use("/api/users", userRoutes);



// // Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const connectDB = require("./config/db");

// const userRoutes = require("./routes/userRoutes");        // ✅ require instead of import
// const authRoutes = require("./routes/authRoutes");
// const appointmentRoutes = require("./routes/appointmentRoutes");

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // DB Connection
// connectDB();

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/users", userRoutes);   // profile API if you created userRoutes.js

// // Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => res.json({ message: "API is running..." }));

// Test route to verify API is working
app.get("/api/test", (req, res) => {
    res.json({
        message: "API test successful",
        timestamp: new Date().toISOString()
    });
});

// Debug route to test without auth
app.get("/api/debug/profile", async (req, res) => {
    try {
        const User = (await import("./models/User.js")).default;
        const user = await User.findOne({ email: "prajapatit097@gmail.com" }).select("-password");
        res.json({ debug: true, user });
    } catch (error) {
        res.json({ debug: true, error: error.message });
    }
});

// Debug route to check doctors
app.get("/api/debug/doctors", async (req, res) => {
    try {
        const User = (await import("./models/User.js")).default;
        const doctors = await User.find({ role: "doctor" }).select("-password");
        res.json({ debug: true, doctors, count: doctors.length });
    } catch (error) {
        res.json({ debug: true, error: error.message });
    }
});

// Debug route to check patients
app.get("/api/debug/patients", async (req, res) => {
    try {
        const User = (await import("./models/User.js")).default;
        const patients = await User.find({ role: "patient" }).select("-password");
        res.json({ debug: true, patients, count: patients.length });
    } catch (error) {
        res.json({ debug: true, error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
