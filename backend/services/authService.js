import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
    return jwt.sign(
        { userId, type: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

// Verify password reset token
export const verifyPasswordResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "password-reset") {
            throw new Error("Invalid token type");
        }
        return { success: true, decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Find user by email
export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

// Create new user
export const createUser = async (userData) => {
    const user = new User(userData);
    await user.save();
    return user;
};

// Check if user exists
export const checkUserExists = async (email) => {
    const existingUser = await User.findOne({ email });
    return !!existingUser;
};