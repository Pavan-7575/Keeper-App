import pool from '../config/db.js';

class ReminderModel {
    static async setReminder(noteId, { reminder_datetime, notification_sound = 'chime', repeat_type = 'none' }) {
        // Upsert reminder for note
        const query = `
            INSERT INTO reminders (note_id, reminder_datetime, notification_sound, repeat_type, is_active)
            VALUES ($1, $2, $3, $4, TRUE)
            RETURNING *;
        `;
        // Deactivate previous active reminders for this note
        await pool.query('UPDATE reminders SET is_active = FALSE WHERE note_id = $1;', [noteId]);
        const res = await pool.query(query, [noteId, reminder_datetime, notification_sound, repeat_type]);
        return res.rows[0];
    }

    static async getReminderByNoteId(noteId) {
        const res = await pool.query(
            'SELECT * FROM reminders WHERE note_id = $1 AND is_active = TRUE;',
            [noteId]
        );
        return res.rows[0] || null;
    }

    static async deleteReminder(noteId) {
        await pool.query('UPDATE reminders SET is_active = FALSE WHERE note_id = $1;', [noteId]);
    }

    static async getActiveReminders() {
        const sql = `
            SELECT r.*, n.user_id, n.title, n.content
            FROM reminders r
            JOIN notes n ON r.note_id = n.id
            WHERE r.is_active = TRUE 
              AND r.reminder_datetime <= NOW()
              AND n.is_deleted = FALSE;
        `;
        const res = await pool.query(sql);
        return res.rows;
    }

    static async createNotification(reminderId, status = 'sent') {
        const query = `
            INSERT INTO notifications (reminder_id, status, sent_time)
            VALUES ($1, $2, NOW())
            RETURNING *;
        `;
        const res = await pool.query(query, [reminderId, status]);
        return res.rows[0];
    }
}

export default ReminderModel;
