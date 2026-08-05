import NoteModel from '../models/Note.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const getNotes = async (req, res, next) => {
    try {
        const { search, filter, sortBy, categoryId } = req.query;
        const notes = await NoteModel.getNotes(req.user.id, {
            search,
            filter,
            sortBy,
            categoryId: categoryId ? parseInt(categoryId, 10) : null,
        });
        return sendSuccess(res, 200, 'Notes retrieved successfully.', notes);
    } catch (error) {
        next(error);
    }
};

export const getNoteById = async (req, res, next) => {
    try {
        const note = await NoteModel.getNoteById(req.user.id, req.params.id);
        if (!note) {
            return sendError(res, 404, 'Note not found or access denied.');
        }
        return sendSuccess(res, 200, 'Note retrieved successfully.', note);
    } catch (error) {
        next(error);
    }
};

export const createNote = async (req, res, next) => {
    try {
        const { title, content, color, is_pinned, is_archived, is_favorite, category_id, labels } = req.body;
        const note = await NoteModel.createNote(req.user.id, {
            title,
            content,
            color,
            is_pinned,
            is_archived,
            is_favorite,
            category_id,
            labels,
        });
        return sendSuccess(res, 201, 'Note created successfully.', note);
    } catch (error) {
        next(error);
    }
};

export const updateNote = async (req, res, next) => {
    try {
        const updated = await NoteModel.updateNote(req.user.id, req.params.id, req.body);
        if (!updated) {
            return sendError(res, 404, 'Note not found or unauthorized.');
        }
        return sendSuccess(res, 200, 'Note updated successfully.', updated);
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req, res, next) => {
    try {
        const result = await NoteModel.deleteNote(req.user.id, req.params.id);
        if (!result) {
            return sendError(res, 404, 'Note not found or unauthorized.');
        }
        const message = result.hardDeleted ? 'Note permanently deleted.' : 'Note moved to trash.';
        return sendSuccess(res, 200, message, result);
    } catch (error) {
        next(error);
    }
};

export const restoreNote = async (req, res, next) => {
    try {
        const restored = await NoteModel.restoreNote(req.user.id, req.params.id);
        if (!restored) {
            return sendError(res, 404, 'Note not found or unauthorized.');
        }
        return sendSuccess(res, 200, 'Note restored successfully.', restored);
    } catch (error) {
        next(error);
    }
};

export const duplicateNote = async (req, res, next) => {
    try {
        const duplicated = await NoteModel.duplicateNote(req.user.id, req.params.id);
        if (!duplicated) {
            return sendError(res, 404, 'Note not found or unauthorized.');
        }
        return sendSuccess(res, 201, 'Note duplicated successfully.', duplicated);
    } catch (error) {
        next(error);
    }
};

export const getNoteStats = async (req, res, next) => {
    try {
        const stats = await NoteModel.getStats(req.user.id);
        return sendSuccess(res, 200, 'User note stats retrieved.', stats);
    } catch (error) {
        next(error);
    }
};
