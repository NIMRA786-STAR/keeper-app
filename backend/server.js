// File: backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const aiRoutes = require("./routes/ai");
const notesRoutes = require("./routes/notes");
const authRoutes = require("./routes/auth");

const app = express();
const startTime = Date.now();

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: "1mb" }));


// ===== Env Check =====
const REQUIRED_VARS = ["PORT", "MONGODB_URI", "OPENAI_API_KEY", "JWT_SECRET"];
const missingVars = REQUIRED_VARS.filter(v => !process.env[v]);
if (missingVars.length) {
  console.error("❌ Missing required environment variables:", missingVars.join(", "));
  process.exit(1);
}

console.log("✅ .env loaded successfully");
console.log("🔍 ENVIRONMENT VARIABLES:");
console.log(`   OPENAI_API_KEY: Set (${process.env.OPENAI_API_KEY.slice(0, 10)}...)`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`   PORT: ${process.env.PORT}`);

// ===== Route Loading =====
console.time("⏱️ Route initialization time");
app.use("/ai", aiRoutes);
app.use("/notes", notesRoutes);
app.use("/api/auth", authRoutes);
console.timeEnd("⏱️ Route initialization time");

// Health Check Endpoint
app.get("/", (req, res) => {
  const uptime = ((Date.now() - startTime) / 1000).toFixed(2);
  res.status(200).json({
    status: "✅ Keeper Backend API Running",
    uptime: `${uptime}s`,
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// ===== MongoDB Connection =====
mongoose.set("strictQuery", true);
console.time("⏱️ MongoDB connection time");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.timeEnd("⏱️ MongoDB connection time");
    console.log("✅ Connected to MongoDB");
    logSystemReady();
  })
  .catch(err => {
    console.error("💥 MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ===== Global Error Handling =====
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== Server Start =====
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Backend ready for requests");
});

// ===== Health Logging =====
function logSystemReady() {
  const totalInit = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("\n📊 SYSTEM HEALTH REPORT");
  console.log("----------------------------");
  console.log(`🧠 AI Service: Ready (OpenAI + Local Fallback Engine)`);
  console.log(`🗄️ MongoDB: Connected`);
  console.log(`🚀 Express: Running on port ${PORT}`);
  console.log(`🕒 Startup Time: ${totalInit}s`);
  console.log("----------------------------\n");
}

// ===== Graceful Shutdown =====
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("🔌 Closing HTTP server...");
    try {
      await mongoose.connection.close(false);
      console.log("🗄️ MongoDB connection closed cleanly.");
    } catch (err) {
      console.error("💥 Error closing MongoDB:", err.message);
    }
    console.log("👋 Server stopped safely. Exiting now.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT (Ctrl+C)"));
process.on("SIGTERM", () => shutdown("SIGTERM (App Stop)"));
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  shutdown("UncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Promise Rejection:", reason);
  shutdown("UnhandledRejection");
});


// Add this before the global error handler in server.js

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

