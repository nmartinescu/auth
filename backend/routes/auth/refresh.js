import express from "express";
import { verifyRefreshToken, generateTokens, findUserByEmail } from "../../services/authService.js";
import User from "../../models/User.js";

const router = express.Router();

// Refresh token endpoint
router.post("/", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required",
                code: "REFRESH_TOKEN_REQUIRED"
            });
        }

        // Verify refresh token
        const tokenVerification = verifyRefreshToken(refreshToken);
        if (!tokenVerification.success) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
                code: "REFRESH_TOKEN_INVALID"
            });
        }

        // Find user
        const user = await User.findById(tokenVerification.decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                code: "USER_NOT_FOUND"
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            data: {
                user: user.toJSON(),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
            },
        });
    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            code: "INTERNAL_ERROR"
        });
    }
});

export default router;