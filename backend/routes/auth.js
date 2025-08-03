import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/resendService.js";

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Register endpoint
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        // Handle mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (err) => err.message
            );
            return res.status(400).json({
                success: false,
                message: messages.join(". "),
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            { userId: user._id, type: "password-reset" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken);
        
        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            // Still return success to not reveal if email exists
        } else {
            console.log('Password reset email sent successfully:', emailResult.messageId);
        }

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
            // For demo/development - remove in production
            ...(process.env.NODE_ENV === 'development' && { resetToken: resetToken })
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Validation
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Token, new password, and confirm password are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.type !== "password-reset") {
                throw new Error("Invalid token type");
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Middleware to verify JWT token and get user
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Delete account endpoint
router.delete("/delete-account", authenticateToken, async (req, res) => {
    try {
        const { password, confirmDeletion } = req.body;
        const user = req.user;

        // Validation
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required to delete account",
            });
        }

        if (confirmDeletion !== "DELETE MY ACCOUNT") {
            return res.status(400).json({
                success: false,
                message: "Please type 'DELETE MY ACCOUNT' to confirm deletion",
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Log account deletion for audit purposes
        console.log(`Account deletion requested for user: ${user.email} (ID: ${user._id}) at ${new Date().toISOString()}`);

        // Delete user account
        await User.findByIdAndDelete(user._id);

        // Log successful deletion
        console.log(`Account successfully deleted for user: ${user.email} (ID: ${user._id}) at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: "Account has been permanently deleted",
        });
    } catch (error) {
        console.error("Account deletion error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

export default router;
