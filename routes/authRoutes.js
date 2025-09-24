// const express = require("express");
// const { signup, login, getProfile } = require("../controllers/authController");
// const { protect } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.post("/signup", signup);
// router.post("/login", login);

// //  New route for fetching profile (protected)
// router.get("/profile", protect, getProfile);

// module.exports = router;
// routes/userRoutes.js

// routes/userRoutes.js
// routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;


