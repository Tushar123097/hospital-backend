const User = require("../models/User");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");

// Helper: Generate random password
function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

// -------------------- SIGNUP --------------------
exports.signup = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const password = generatePassword();

    // Save user
    user = new User({ name, email, password, role });
    await user.save();

    // Send password to email
    await transporter.sendMail({
      from: `"MyApp Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your App Password",
      text: `Hello ${name},\n\nYour password is: ${password}\n\nUse this to login.`,
    });

    res.json({ message: "User created & password sent to email" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
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
