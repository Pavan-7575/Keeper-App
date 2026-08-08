import express from 'express';
import passport from 'passport';
import {
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';
import {
    registerValidationRules,
    loginValidationRules,
    forgotPasswordValidationRules,
    resetPasswordValidationRules,
    handleValidationErrors,
} from '../middlewares/validationMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtils.js';
import UserModel from '../models/User.js';

const router = express.Router();

// Authentication Endpoints
router.post('/register', authLimiter, registerValidationRules, handleValidationErrors, register);
router.post('/login', authLimiter, loginValidationRules, handleValidationErrors, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordValidationRules, handleValidationErrors, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidationRules, handleValidationErrors, resetPassword);

// Helper to ensure OAuth strategy is registered
const ensureOAuthStrategy = (strategyName, errorKey) => (req, res, next) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!passport._strategies[strategyName]) {
        return res.redirect(`${clientUrl}?error=${errorKey}`);
    }
    next();
};

// OAuth Google Routes
router.get('/google', ensureOAuthStrategy('google', 'google_not_configured'), passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    ensureOAuthStrategy('google', 'google_not_configured'),
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}?error=oauth_failed`, session: false }),
    async (req, res) => {
        try {
            const user = req.user;
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await UserModel.saveSession(user.id, refreshToken, expiresAt);

            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(`${clientUrl}?token=${accessToken}`);
        } catch (error) {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=oauth_error`);
        }
    }
);

// OAuth Facebook Routes
router.get('/facebook', ensureOAuthStrategy('facebook', 'facebook_not_configured'), passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    ensureOAuthStrategy('facebook', 'facebook_not_configured'),
    passport.authenticate('facebook', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}?error=oauth_failed`, session: false }),
    async (req, res) => {
        try {
            const user = req.user;
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await UserModel.saveSession(user.id, refreshToken, expiresAt);

            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(`${clientUrl}?token=${accessToken}`);
        } catch (error) {
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=oauth_error`);
        }
    }
);

export default router;
