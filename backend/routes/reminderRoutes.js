import express from 'express';
import { setReminder, deleteReminder } from '../controllers/reminderController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/:noteId', setReminder);
router.delete('/:noteId', deleteReminder);

export default router;
