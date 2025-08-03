import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/index.js";
import { connectDB } from "./config/db.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Routes
// app.get("/", (req, res) => {
//     res.json({ message: "Server is running!" });
// });

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});
