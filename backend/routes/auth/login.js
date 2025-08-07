import express from "express";
import { validateLogin } from "../../validators/authValidators.js";
import { generateTokens, findUserByEmail } from "../../services/authService.js";
import { authLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

// Login endpoint with rate limiting
router.post("/", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        // Validation
        const validation = validateLogin({ email, password });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(". "),
            });
        }

        // Find user by email
        const user = await findUserByEmail(email);
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

        // Generate tokens
        const tokens = generateTokens(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: user.toJSON(),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
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

export default router;
