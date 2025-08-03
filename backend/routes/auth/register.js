import express from "express";
import { validateRegistration } from "../../validators/authValidators.js";
import { generateToken, createUser, checkUserExists } from "../../services/authService.js";

const router = express.Router();

// Register endpoint
router.post("/", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        const validation = validateRegistration({ name, email, password, confirmPassword });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(". "),
            });
        }

        // Check if user already exists
        const userExists = await checkUserExists(email);
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Create new user
        const user = await createUser({ name, email, password });

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

export default router;