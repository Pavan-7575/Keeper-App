import express from 'express';
import { getProfile, updateProfile, uploadProfilePicture, updatePassword } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { uploadProfileImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-avatar', uploadProfileImage.single('avatar'), uploadProfilePicture);
router.put('/change-password', updatePassword);

export default router;
