import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import User from "../models/User.js";

// Helper: Generate random password
function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

// -------------------- SIGNUP --------------------
export const signup = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    // 1️⃣ Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    // 2️⃣ Generate random password
    const password = Math.random().toString(36).slice(-8);

    // 3️⃣ Save user to DB
    user = new User({ name, email, password, role });
    await user.save();

    // 4️⃣ Send password email (wrap in try/catch)
    try {
      const info = await transporter.sendMail({
        from: `"MyApp Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your App Password",
        text: `Hello ${name},\n\nYour password is: ${password}\n\nUse this to login.`,
      });
      console.log("Signup email sent:", info.messageId);
    } catch (emailErr) {
      console.error("Signup email failed:", emailErr.message);
      // Do NOT throw error, signup continues
    }

    // 5️⃣ Return response
    res.status(201).json({ message: "User created & password sent to email (if email worked)" });

  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
};


// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    // `req.user` will be set by protect middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default { signup, login, getProfile };
