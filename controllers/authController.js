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

    // ✅ No manual hashing - Let `pre("save")` handle it
    const newUser = new User({ firstName, lastName, email, password });

    await newUser.save();
    console.log("✅ User saved successfully.");

    res.status(201).json({ message: "User registered successfully" });
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

    console.log("✅ User found in DB:", user.email);
    console.log("🔍 Hashed Password in DB:", user.password);
    console.log("🔍 Entered Password:", password);

    // ✅ Use the comparePassword method from the User model
    const isMatch = await user.comparePassword(password);

    console.log("🔍 Password Match Result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    console.log("🟢 Login successful for:", user.email);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("❌ Error during signin:", err);
    res.status(500).json({ error: "An error occurred during signin. Please try again." });
  }
};



  
  

exports.checkUser = async (req, res) => {
  try {
    const { firstName } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    console.log("🟢 Checking user:", firstName);

    if (!token || !firstName) {
      console.log("🛑 Missing token or firstName");
      return res.status(400).json({ error: "Missing token or firstName" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ firstName, _id: decoded.userId });

    if (!user) {
      console.log("🛑 User not found:", firstName);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", user.firstName);
    res.status(200).json({ message: "User exists", user: { email: user.email, firstName: user.firstName } });

  } catch (err) {
    console.error("❌ Error checking user:", err);
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



  