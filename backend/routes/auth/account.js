import express from "express";
import { authenticateToken } from "../../middleware/auth.js";
import { validateAccountDeletion } from "../../validators/authValidators.js";
import User from "../../models/User.js";

const router = express.Router();

// Delete account endpoint
router.delete("/delete", authenticateToken, async (req, res) => {
    try {
        const { password, confirmDeletion } = req.body;
        const user = req.user;

        // Validation
        const validation = validateAccountDeletion({ password, confirmDeletion });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(". "),
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