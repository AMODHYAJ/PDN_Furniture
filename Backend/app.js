const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./Route/AuthRoutes");
const userRoutes = require("./Route/UserRoutes");
const orderRoutes = require("./Route/OrderRoutes");
const wishlistRoutes = require("./Route/WishlistRoutes");
const productRoutes = require("./Route/ProductRoutes"); // Contains upload middleware
const cartRoutes = require("./Route/CartRoutes");
const ProductViewRoutes = require('./Route/ProductViewRoutes');
const discountRoutes = require('./Route/DiscountRoutes');
const exportRoutes = require("./Route/exportRoutes");
const router = require("./Route/InventoryRoute");
const empRouter = require("./Route/EmpRoutes");
const taskRouter = require("./Route/TaskRoutes");
const productReportRoutes = require('./Route/ProductReportRoute');
const analyticsRoutes = require('./Route/AnalyticsRoutes');
const inventoryReportRoute = require('./Route/inventoryReportRoute');
const deliveryRoutes = require('./Route/deliveryRoutes');
const deliveryOfficerRoutes = require('./Route/deliveryOfficerRoutes');
const inventoryAIRoutes = require('./Route/inventoryAIRoutes');
const notificationRoutes = require('./Route/notificationRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/wishlists", wishlistRoutes);
app.use("/products", productRoutes); // Product routes with upload middleware
app.use("/cart", cartRoutes);
app.use("/api", ProductViewRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api",exportRoutes);
app.use("/inventory",router);
app.use("/employees", empRouter);
app.use("/tasks", taskRouter);
app.use('/reports', productReportRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/api/reports',inventoryReportRoute);
app.use("/delivery",deliveryRoutes);
app.use("/delivery-officers",deliveryOfficerRoutes);
app.use("/api/inventory-ai",inventoryAIRoutes);
app.use("/api/notifications",notificationRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer file type errors
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ 
      success: false,
      message: "Invalid file type. Only JPEG, JPG, PNG, and GIF images are allowed."
    });
  }
  
  // Handle multer file size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false,
      message: "File too large. Maximum size is 5MB."
    });
  }

  // Generic error handler
  res.status(500).json({ 
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// MongoDB connection with improved configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:LSU3X5WXNVLEimhz@cluster0.ze9pt.mongodb.net/your-database-name";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  retryWrites: true,
  w: "majority"
})
.then(() => {
  console.log("✅ Connected to MongoDB");
  
  // Initialize cron jobs after successful DB connection
  const cron = require('./cronJobs');
  if (!cron) {
    console.warn('⚠️ Continuing without cron jobs');
  }
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1); // Exit process on connection failure
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT. Closing server gracefully...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("🔴 MongoDB connection closed");
      process.exit(0);
    });
  });
});

process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM. Closing server gracefully...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("🔴 MongoDB connection closed");
      process.exit(0);
    });
  });
});