import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { app, server } from './lib/socket.js';



// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();


const PORT = process.env.PORT || 3000;
const _dirname = path.resolve()

app.use(express.json({ limit: '40mb' })); // or whatever size you need
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Serve frontend in production

if (process.env.NODE_ENV === "production") {
  // Serve the static files
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // Handle client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });

  // server.listen(PORT, () => {
  //     console.log(`Server running on port ${PORT}`);
  //   });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});




server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

export default app;