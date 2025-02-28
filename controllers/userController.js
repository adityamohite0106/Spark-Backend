const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { username, email, profilePicture } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete current user's account
// @route   DELETE /api/users/me
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDeviceStats = async (req, res) => {
  try {
    const deviceStats = await User.aggregate([
      { $unwind: "$devices" },
      {
        $group: {
          _id: "$devices.deviceType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(deviceStats);
  } catch (error) {
    console.error("Error fetching device stats:", error);
    res.status(500).json({ error: "Failed to fetch device stats" });
  }
};
