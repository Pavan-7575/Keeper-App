import bcrypt from 'bcrypt';
import crypto from 'crypto';
import UserModel from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

const SALT_ROUNDS = 12;

export const register = async (req, res, next) => {
    try {
        const { first_name, last_name, username, email, password } = req.body;

        // Check if email or username already registered
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            return sendError(res, 400, 'An account with this email address already exists.');
        }

        const existingUsername = await UserModel.findByUsername(username);
        if (existingUsername) {
            return sendError(res, 400, 'Username is already taken. Please choose another.');
        }

        // Hash password with bcrypt salt rounds 12
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        const verification_token = crypto.randomBytes(32).toString('hex');

        // Create User
        const user = await UserModel.createUser({
            first_name,
            last_name,
            username,
            email,
            password_hash,
            verification_token,
        });

        // Send email verification
        await sendVerificationEmail(email, verification_token);

        return sendSuccess(res, 201, 'User registered successfully. Please verify your email.', {
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                email_verified: user.email_verified,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        // Find user by email OR username
        let user = await UserModel.findByEmail(identifier);
        if (!user) {
            user = await UserModel.findByUsername(identifier);
        }

        if (!user) {
            return sendError(res, 401, 'Invalid credentials. User not found.');
        }

        if (!user.password_hash) {
            return sendError(res, 400, 'This account was created via OAuth (Google/Facebook). Please log in using social login.');
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials. Password incorrect.');
        }

        // Issue JWT Tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store Session Refresh Token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await UserModel.saveSession(user.id, refreshToken, expiresAt);

        // Set Refresh Token HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        return sendSuccess(res, 200, 'Logged in successfully.', {
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                profile_image: user.profile_image,
                email_verified: user.email_verified,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            return sendError(res, 401, 'Refresh token missing.');
        }

        const session = await UserModel.findSession(token);
        if (!session) {
            return sendError(res, 403, 'Invalid or expired refresh session.');
        }

        const decoded = verifyRefreshToken(token);
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return sendError(res, 404, 'User associated with session not found.');
        }

        const newAccessToken = generateAccessToken(user);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        return sendSuccess(res, 200, 'Token refreshed successfully.', {
            accessToken: newAccessToken,
        });
    } catch (error) {
        return sendError(res, 403, 'Invalid or expired refresh token.');
    }
};

export const logout = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (token) {
            await UserModel.deleteSession(token);
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return sendSuccess(res, 200, 'Logged out successfully.');
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) {
            return sendError(res, 400, 'Verification token is required.');
        }

        const user = await UserModel.findByVerificationToken(token);
        if (!user) {
            return sendError(res, 400, 'Invalid or expired email verification token.');
        }

        await UserModel.updateEmailVerified(user.id);
        return sendSuccess(res, 200, 'Email verified successfully. You can now log in.');
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findByEmail(email);

        if (!user) {
            // Always return success to prevent email enumeration
            return sendSuccess(res, 200, 'If an account with that email exists, a password reset link has been sent.');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await UserModel.setResetPasswordToken(user.id, resetToken, expires);
        await sendPasswordResetEmail(email, resetToken);

        return sendSuccess(res, 200, 'If an account with that email exists, a password reset link has been sent.');
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const user = await UserModel.findByResetToken(token);

        if (!user) {
            return sendError(res, 400, 'Invalid or expired password reset token.');
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        await UserModel.updatePassword(user.id, password_hash);
        await UserModel.deleteUserSessions(user.id);

        return sendSuccess(res, 200, 'Password has been reset successfully. Please log in with your new password.');
    } catch (error) {
        next(error);
    }
};
