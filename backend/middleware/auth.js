import { verifyAccessToken } from "../services/authService.js";
import User from "../models/User.js";

// Middleware to verify JWT access token and get user
export const authenticateToken = async (req, res, next) => {
    console.log("authenticateToken middleware called");
    console.log("Headers:", req.headers.authorization);
    
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            console.log("No token provided");
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                code: 'TOKEN_REQUIRED'
            });
        }

        console.log("Token found, verifying...");
        const tokenVerification = verifyAccessToken(token);
        if (!tokenVerification.success) {
            console.log("Token verification failed");
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired access token',
                code: 'TOKEN_EXPIRED'
            });
        }

        console.log("Token verified, looking up user...");
        const user = await User.findById(tokenVerification.decoded.userId);
        if (!user) {
            console.log("User not found");
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        req.user = user;
        console.log("User authenticated successfully:", user.email);
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            code: 'TOKEN_INVALID'
        });
    }
};