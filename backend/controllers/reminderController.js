import ReminderModel from '../models/Reminder.js';
import NoteModel from '../models/Note.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export const setReminder = async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const { reminder_datetime, notification_sound, repeat_type } = req.body;

        const note = await NoteModel.getNoteById(req.user.id, noteId);
        if (!note) {
            return sendError(res, 404, 'Note not found or unauthorized.');
        }

        const reminder = await ReminderModel.setReminder(noteId, {
            reminder_datetime,
            notification_sound,
            repeat_type,
        });

        return sendSuccess(res, 200, 'Reminder scheduled successfully.', reminder);
    } catch (error) {
        next(error);
    }
};

export const deleteReminder = async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const note = await NoteModel.getNoteById(req.user.id, noteId);
        if (!note) {
            return sendError(res, 404, 'Note not found or unauthorized.');
        }

        await ReminderModel.deleteReminder(noteId);
        return sendSuccess(res, 200, 'Reminder cancelled.');
    } catch (error) {
        next(error);
    }
};
