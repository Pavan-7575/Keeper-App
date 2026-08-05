import express from 'express';
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    duplicateNote,
    getNoteStats,
} from '../controllers/noteController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { noteValidationRules, handleValidationErrors } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getNotes);
router.get('/stats', getNoteStats);
router.get('/:id', getNoteById);
router.post('/', noteValidationRules, handleValidationErrors, createNote);
router.put('/:id', noteValidationRules, handleValidationErrors, updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/restore', restoreNote);
router.post('/:id/duplicate', duplicateNote);

export default router;
