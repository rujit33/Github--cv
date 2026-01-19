/**
 * Backend Server for GitHub to CV
 * Securely handles API keys and proxies requests to GitHub and OpenRouter APIs
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import githubRouter from "./routes/github.js";
import llmRouter from "./routes/llm.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      github: !!process.env.GITHUB_TOKEN,
      llm: !!process.env.OPENROUTER_API_KEY,
    },
  });
});

// API Routes
app.use("/api/github", githubRouter);
app.use("/api/llm", llmRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📊 GitHub API: ${process.env.GITHUB_TOKEN ? "✅ Authenticated" : "⚠️  Public (rate limited)"}`,
  );
  console.log(
    `🤖 LLM Service: ${process.env.OPENROUTER_API_KEY ? "✅ Configured" : "❌ Not configured"}`,
  );
});
