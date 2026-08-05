import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

const SALT_ROUNDS = 12;

export const getProfile = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return sendError(res, 404, 'User not found.');
        }
        return sendSuccess(res, 200, 'User profile retrieved.', user);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { first_name, last_name, username } = req.body;

        if (username) {
            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername && existingUsername.id !== req.user.id) {
                return sendError(res, 400, 'Username is already taken by another user.');
            }
        }

        const updatedUser = await UserModel.updateProfile(req.user.id, {
            first_name,
            last_name,
            username,
        });

        return sendSuccess(res, 200, 'Profile updated successfully.', updatedUser);
    } catch (error) {
        next(error);
    }
};

export const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, 400, 'No image file uploaded.');
        }

        const profile_image = `/uploads/${req.file.filename}`;
        const updatedUser = await UserModel.updateProfile(req.user.id, { profile_image });

        return sendSuccess(res, 200, 'Profile picture uploaded successfully.', updatedUser);
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;

        const user = await UserModel.findByEmail(req.user.email);
        if (!user || !user.password_hash) {
            return sendError(res, 400, 'Password cannot be changed for social login accounts.');
        }

        const isMatch = await bcrypt.compare(current_password, user.password_hash);
        if (!isMatch) {
            return sendError(res, 401, 'Current password is incorrect.');
        }

        const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
        await UserModel.updatePassword(req.user.id, password_hash);

        return sendSuccess(res, 200, 'Password updated successfully.');
    } catch (error) {
        next(error);
    }
};
