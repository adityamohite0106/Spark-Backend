const Dashboard = require("../models/userDashboardSchema"); // ✅ Import correct model

// ✅ Fetch user dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const { email } = req.query; // ✅ Get email from query parameters

    if (!email) {
      return res.status(400).json({ message: "❌ Email is required!" });
    }

    const dashboard = await Dashboard.findOne({ email });

    if (!dashboard) {
      return res.status(404).json({ message: "❌ Dashboard not found for this email!" });
    }

    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch dashboard", error: error.message });
  }
};

// ✅ Update user dashboard data
exports.updateDashboardData = async (req, res) => {
  try {
    const { email } = req.query; // ✅ Get email from query parameters
    const { profile, links, mobLinks, appearance, analytics, settings } = req.body;

    if (!email) {
      return res.status(400).json({ message: "❌ Email is required!" });
    }

    let dashboard = await Dashboard.findOne({ email });

    if (dashboard) {
      dashboard.profile = profile || dashboard.profile;
      dashboard.links = links || dashboard.links;
      dashboard.mobLinks = mobLinks || dashboard.mobLinks;
      dashboard.appearance = appearance || dashboard.appearance;
      dashboard.analytics = analytics || dashboard.analytics;
      dashboard.settings = settings || dashboard.settings;
      await dashboard.save();
    } else {
      dashboard = new Dashboard({ email, profile, links, mobLinks, appearance, analytics, settings });
      await dashboard.save();
    }

    res.status(200).json({ message: "✅ Dashboard updated successfully!", dashboard });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to update dashboard", error: error.message });
  }
};

// ✅ Delete user dashboard data
exports.deleteDashboardData = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "❌ Email is required!" });
    }

    const deletedData = await Dashboard.findOneAndDelete({ email });

    if (!deletedData) {
      return res.status(404).json({ message: "❌ Dashboard data not found" });
    }

    res.status(200).json({ message: "✅ Dashboard data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to delete dashboard data", error: error.message });
  }
};
