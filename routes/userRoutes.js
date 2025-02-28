// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");

// ... Existing routes (login, delete, etc.)

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private (requires JWT authentication)
router.get("/me", auth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await userModel.findById(id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Existing PUT route (updated for consistency)
router.put("/me", auth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { firstName, lastName, email, profileTitle, password } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (profileTitle) updates.profileTitle = profileTitle;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const user = await userModel.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ... Other routes (login, delete, device-stats)

module.exports = router;