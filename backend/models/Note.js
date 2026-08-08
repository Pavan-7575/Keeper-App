import pool from '../config/db.js';

class NoteModel {
    static async createNote(userId, {
        title = '',
        content = '',
        color = '#ffffff',
        is_pinned = false,
        is_archived = false,
        is_favorite = false,
        is_completed = false,
        category_id = null,
        labels = []
    }) {
        const query = `
            INSERT INTO notes (user_id, title, content, color, is_pinned, is_archived, is_favorite, is_completed, category_id, labels)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [userId, title, content, color, is_pinned, is_archived, is_favorite, is_completed, category_id, labels];
        const res = await pool.query(query, values);
        return res.rows[0];
    }

    static async getNotes(userId, {
        search = '',
        filter = 'all', // all, completed, pending, archived, pinned, favorites, deleted
        sortBy = 'newest', // newest, oldest, alphabetical, reminder
        categoryId = null
    } = {}) {
        let whereConditions = ['n.user_id = $1'];
        let queryParams = [userId];
        let paramIndex = 2;

        // Filter status handling
        if (filter === 'deleted') {
            whereConditions.push('n.is_deleted = TRUE');
        } else if (filter === 'archived') {
            whereConditions.push('n.is_archived = TRUE AND n.is_deleted = FALSE');
        } else {
            whereConditions.push('n.is_deleted = FALSE AND n.is_archived = FALSE');
        }

        if (filter === 'completed') {
            whereConditions.push('n.is_completed = TRUE');
        } else if (filter === 'pending') {
            whereConditions.push('n.is_completed = FALSE');
        } else if (filter === 'pinned') {
            whereConditions.push('n.is_pinned = TRUE');
        } else if (filter === 'favorites') {
            whereConditions.push('n.is_favorite = TRUE');
        }

        if (categoryId) {
            whereConditions.push(`n.category_id = $${paramIndex++}`);
            queryParams.push(categoryId);
        }

        // Search in title, content, category name, or labels
        if (search && search.trim() !== '') {
            const searchPattern = `%${search.trim()}%`;
            whereConditions.push(`(
                n.title ILIKE $${paramIndex} OR 
                n.content ILIKE $${paramIndex} OR 
                c.name ILIKE $${paramIndex} OR 
                $${paramIndex + 1} = ANY(n.labels)
            )`);
            queryParams.push(searchPattern);
            queryParams.push(search.trim());
            paramIndex += 2;
        }

        // Sorting
        let orderByClause = 'ORDER BY n.is_pinned DESC, n.updated_at DESC';
        if (sortBy === 'oldest') {
            orderByClause = 'ORDER BY n.created_at ASC';
        } else if (sortBy === 'alphabetical') {
            orderByClause = 'ORDER BY n.title ASC';
        } else if (sortBy === 'reminder') {
            orderByClause = 'ORDER BY r.reminder_datetime ASC NULLS LAST, n.updated_at DESC';
        } else if (sortBy === 'newest') {
            orderByClause = 'ORDER BY n.is_pinned DESC, n.created_at DESC';
        }

        const sql = `
            SELECT 
                n.*,
                c.name AS category_name,
                r.id AS reminder_id,
                r.reminder_datetime,
                r.notification_sound,
                r.repeat_type,
                r.is_active AS reminder_is_active
            FROM notes n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN reminders r ON n.id = r.note_id AND r.is_active = TRUE
            WHERE ${whereConditions.join(' AND ')}
            ${orderByClause};
        `;

        const res = await pool.query(sql, queryParams);
        return res.rows;
    }

    static async getNoteById(userId, noteId) {
        const sql = `
            SELECT 
                n.*,
                c.name AS category_name,
                r.id AS reminder_id,
                r.reminder_datetime,
                r.notification_sound,
                r.repeat_type,
                r.is_active AS reminder_is_active
            FROM notes n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN reminders r ON n.id = r.note_id AND r.is_active = TRUE
            WHERE n.id = $1 AND n.user_id = $2;
        `;
        const res = await pool.query(sql, [noteId, userId]);
        return res.rows[0] || null;
    }

    static async updateNote(userId, noteId, updates) {
        const allowedFields = [
            'title', 'content', 'color', 'is_pinned',
            'is_archived', 'is_deleted', 'is_completed',
            'is_favorite', 'category_id', 'labels'
        ];

        const fields = [];
        const values = [];
        let index = 1;

        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                fields.push(`${key} = $${index++}`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) return await this.getNoteById(userId, noteId);

        fields.push(`updated_at = NOW()`);
        values.push(noteId);
        values.push(userId);

        const sql = `
            UPDATE notes
            SET ${fields.join(', ')}
            WHERE id = $${index++} AND user_id = $${index}
            RETURNING *;
        `;

        const res = await pool.query(sql, values);
        return res.rows[0];
    }

    static async deleteNote(userId, noteId) {
        // If note is already in trash (is_deleted = true), perform hard delete
        const note = await this.getNoteById(userId, noteId);
        if (!note) return null;

        if (note.is_deleted) {
            await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2;', [noteId, userId]);
            return { hardDeleted: true };
        } else {
            const res = await pool.query(
                'UPDATE notes SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *;',
                [noteId, userId]
            );
            return { ...res.rows[0], hardDeleted: false };
        }
    }

    static async restoreNote(userId, noteId) {
        const res = await pool.query(
            'UPDATE notes SET is_deleted = FALSE, is_archived = FALSE, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *;',
            [noteId, userId]
        );
        return res.rows[0];
    }

    static async duplicateNote(userId, noteId) {
        const original = await this.getNoteById(userId, noteId);
        if (!original) return null;

        return await this.createNote(userId, {
            title: original.title,
            content: original.content,
            color: original.color,
            is_pinned: original.is_pinned,
            category_id: original.category_id,
            labels: original.labels,
        });
    }

    static async getStats(userId) {
        const sql = `
            SELECT 
                COUNT(*) FILTER (WHERE is_deleted = FALSE AND is_archived = FALSE) AS total_notes,
                COUNT(*) FILTER (WHERE is_completed = TRUE AND is_deleted = FALSE) AS completed_count,
                COUNT(*) FILTER (WHERE is_completed = FALSE AND is_deleted = FALSE AND is_archived = FALSE) AS pending_count,
                COUNT(*) FILTER (WHERE is_pinned = TRUE AND is_deleted = FALSE AND is_archived = FALSE) AS pinned_count,
                COUNT(*) FILTER (WHERE is_archived = TRUE AND is_deleted = FALSE) AS archived_count,
                COUNT(*) FILTER (WHERE is_favorite = TRUE AND is_deleted = FALSE) AS favorites_count,
                COUNT(*) FILTER (WHERE is_deleted = TRUE) AS deleted_count
            FROM notes
            WHERE user_id = $1;
        `;
        const res = await pool.query(sql, [userId]);
        return res.rows[0];
    }

    static async cleanupExpiredTrash(days = 30) {
        const sql = `
            DELETE FROM notes
            WHERE is_deleted = TRUE
              AND updated_at < NOW() - INTERVAL '1 day' * $1;
        `;
        const res = await pool.query(sql, [days]);
        if (res.rowCount > 0) {
            console.log(`🧹 Auto-cleaned ${res.rowCount} trash note(s) older than ${days} days.`);
        }
        return res.rowCount;
    }
}

export default NoteModel;
