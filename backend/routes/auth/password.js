import express from "express";
import {
    validateForgotPassword,
    validateResetPassword,
} from "../../validators/authValidators.js";
import {
    findUserByEmail,
    generatePasswordResetToken,
    verifyPasswordResetToken,
} from "../../services/authService.js";
import { sendPasswordResetEmail } from "../../services/resendService.js";
import {
    passwordResetLimiter,
    authLimiter,
} from "../../middleware/rateLimiter.js";
import User from "../../models/User.js";

const router = express.Router();

// Forgot password endpoint with strict rate limiting
router.post("/forgot", passwordResetLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        const validation = validateForgotPassword({ email });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(". "),
            });
        }

        // Find user by email
        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                success: true,
                message:
                    "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token
        const resetToken = generatePasswordResetToken(user._id);

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken);

        if (!emailResult.success) {
            console.error(
                "Failed to send password reset email:",
                emailResult.error
            );
            // Still return success to not reveal if email exists
        } else {
            console.log(
                "Password reset email sent successfully:",
                emailResult.messageId
            );
        }

        res.status(200).json({
            success: true,
            message:
                "If an account with that email exists, a password reset link has been sent.",
            // For demo/development - remove in production
            ...(process.env.NODE_ENV === "development" && {
                resetToken: resetToken,
            }),
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Reset password endpoint with rate limiting
router.post("/reset", authLimiter, async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Validation
        const validation = validateResetPassword({
            token,
            newPassword,
            confirmPassword,
        });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(". "),
            });
        }

        // Verify reset token
        const tokenVerification = verifyPasswordResetToken(token);
        if (!tokenVerification.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }

        // Find user
        const user = await User.findById(tokenVerification.decoded.userId);
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

export default router;
