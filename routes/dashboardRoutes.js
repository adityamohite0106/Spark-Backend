const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG/PNG images are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Use environment variable for base URL
const BASE_URL = process.env.BASE_URL || "https://spark-backend-apj9.onrender.com";

router.get("/", dashboardController.getDashboardData);
router.put("/", dashboardController.updateDashboardData);
router.delete("/", dashboardController.deleteDashboardData);

router.post("/upload", auth, upload.single("profileImage"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${BASE_URL}/uploads/${req.file.filename}`; // Use BASE_URL instead of req.protocol
  
    res.status(200).json({ imageUrl });
  } catch (error) {
   
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;