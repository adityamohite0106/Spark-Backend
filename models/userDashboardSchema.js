const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },

  profile: {
    profileImage: { type: String, default: "" },
    profileTitle: { type: String, required: true },
    bio: { type: String, default: "" },
  },

  links: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
      icon: { type: String, default: "" },
    },
  ],

  mobLinks: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
      icon: { type: String, default: "" },
    },
  ],

  appearance: {
    layout: { type: String, default: "default" },
    buttonStyle: { type: String, default: "default" },
    selectedFont: { type: String, default: "Arial" },
    selectedColor: { type: String, default: "#000000" },
    theme: { type: String, default: "light" },
    bgColor: { type: String, default: "#ffffff" },
  },

  analytics: {
    clicksOnLinks: { type: Number, default: 0 },
    clicksOnShop: { type: Number, default: 0 },
    iconCounts: { type: Map, of: Number, default: {} },
  },

  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    privacy: { type: String, enum: ["public", "private"], default: "public" },
  },

  createdAt: { type: Date, default: Date.now },
},
{ collection: "userdashboards" } 
);

const Dashboard = mongoose.model("Dashboard", DashboardSchema);

module.exports = Dashboard;
