const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Import JWT
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing



exports.signup = async (req, res) => {
  try {
    console.log("🟢 Received Signup Request:", req.body);

    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();
    console.log("✅ User saved successfully.");

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      token,
      user: { email: newUser.email, firstName: newUser.firstName },
    });
  } catch (err) {
    console.error("❌ Error during signup:", err);
    res.status(500).json({ error: "An error occurred during signup. Please try again." });
  }
};



  
  

exports.signin = async (req, res) => {
  try {
    console.log("🟢 Received Signin Request:", req.body);
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email or username and password are required" });
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { firstName: identifier }] });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.status(200).json({
      token,
      user: { id: user._id, firstName: user.firstName, email: user.email },
    });
  } catch (err) {
    console.error("❌ Error during signin:", err);
    res.status(500).json({ error: "An error occurred during signin. Please try again." });
  }
};



  
  

exports.checkUser = async (req, res) => {
  const { firstName } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token || !firstName) {
    return res.status(400).json({ error: "Missing token or firstName" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ firstName, _id: decoded.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: { email: user.email, firstName: user.firstName } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};
  
  
  exports.updateUserProfile = async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      const userId = req.user.id; // ✅ Extract user ID from token (set by `authMiddleware`)
  
      let user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // ✅ Update only provided fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
  
      // ✅ Hash password if updated
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
  
      await user.save();
  
      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  };



  