const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
// const historyRoutes = require("./routes/historyRoutes");

const authRoutes = require("./routes/authRoutes");

const appointmentRoutes = require("./routes/appointmentRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
// app.use("/api/appointments", historyRoutes);
// app.use("/api/appointments", historyRoutes);
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
