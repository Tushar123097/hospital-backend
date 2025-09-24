// routes/userRoutes.js
import express from "express";
import { getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
// import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/profile", protect, getProfile);

export default router;
