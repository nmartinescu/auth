import { verifyAccessToken } from "../services/authService.js";
import User from "../models/User.js";

// Middleware to verify JWT access token and get user
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
                code: 'TOKEN_REQUIRED'
            });
        }

        const tokenVerification = verifyAccessToken(token);
        if (!tokenVerification.success) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired access token',
                code: 'TOKEN_EXPIRED'
            });
        }

        const user = await User.findById(tokenVerification.decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            code: 'TOKEN_INVALID'
        });
    }
};