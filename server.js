const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allow both local and deployed frontend
const allowedOrigins = [
  
 "http://localhost:5173"
];

// ✅ Apply CORS before defining routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // ✅ Allow cookies & authentication
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow required headers
  })
);
app.options("*", cors()); // Enable pre-flight

// ✅ Middleware (Must be before routes)
app.use(express.json()); // Allows Express to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Allows form data parsing
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not defined in .env file!");
  process.exit(1); // Stop the server
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

  console.log("✅ Connected to:", process.env.MONGO_URI);



mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Runtime Error:", err);
});

// ✅ Routes (After Middleware)
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Hello World! Backend is running...");
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});