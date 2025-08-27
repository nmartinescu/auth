import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate access token (short-lived)
export const generateAccessToken = (userId) => {
    return jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, {
        expiresIn: "24h", // 24 hours - more reasonable for development
    });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: "refresh" }, process.env.JWT_SECRET, {
        expiresIn: "7d", // 7 days
    });
};

// Generate both tokens
export const generateTokens = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    return {
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };
};

// Legacy function for backward compatibility
export const generateToken = (userId) => {
    return generateAccessToken(userId);
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
    return jwt.sign(
        { userId, type: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔍 Token decoded successfully:", { userId: decoded.userId, type: decoded.type, exp: new Date(decoded.exp * 1000) });
        
        if (decoded.type !== "access") {
            console.log("❌ Invalid token type:", decoded.type);
            throw new Error("Invalid token type");
        }
        return { success: true, decoded };
    } catch (error) {
        console.log("❌ Token verification error:", error.message);
        return { success: false, error: error.message };
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "refresh") {
            throw new Error("Invalid token type");
        }
        return { success: true, decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
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
