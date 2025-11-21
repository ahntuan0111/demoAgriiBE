const express = require("express");
const cors = require("cors");
const chatRouter = require("./routes/chat");

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/chat", chatRouter);

// Health check
app.get("/", (req, res) => res.send("AI Nhà Nông Backend is running"));

// Health check with AI Engine status
app.get("/health", async (req, res) => {
  const axios = require("axios");
  const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://localhost:8000";
  
  let aiEngineStatus = "disconnected";
  try {
    await axios.get(`${PYTHON_AI_URL}/models`, { timeout: 3000 });
    aiEngineStatus = "connected";
  } catch (error) {
    aiEngineStatus = `error: ${error.message}`;
  }
  
  res.json({
    backend: "running",
    aiEngine: aiEngineStatus,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Accessible from Android emulator at http://10.0.2.2:${PORT}`);
});
