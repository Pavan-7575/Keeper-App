import pool from '../config/db.js';

class UserModel {
    static async createUser({ first_name, last_name, username, email, password_hash, verification_token }) {
        const query = `
            INSERT INTO users (first_name, last_name, username, email, password_hash, verification_token)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, first_name, last_name, username, email, profile_image, email_verified, created_at, updated_at;
        `;
        const values = [first_name, last_name, username, email, password_hash, verification_token];
        const res = await pool.query(query, values);
        return res.rows[0];
    }

    static async findByEmail(email) {
        const res = await pool.query('SELECT * FROM users WHERE email = $1;', [email]);
        return res.rows[0] || null;
    }

    static async findByUsername(username) {
        const res = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);
        return res.rows[0] || null;
    }

    static async findById(id) {
        const res = await pool.query(
            'SELECT id, first_name, last_name, username, email, profile_image, email_verified, created_at, updated_at FROM users WHERE id = $1;',
            [id]
        );
        return res.rows[0] || null;
    }

    static async findByVerificationToken(token) {
        const res = await pool.query('SELECT * FROM users WHERE verification_token = $1;', [token]);
        return res.rows[0] || null;
    }

    static async findByResetToken(token) {
        const res = await pool.query(
            'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW();',
            [token]
        );
        return res.rows[0] || null;
    }

    static async updateEmailVerified(id) {
        const res = await pool.query(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL, updated_at = NOW() WHERE id = $1 RETURNING id, email_verified;',
            [id]
        );
        return res.rows[0];
    }

    static async setResetPasswordToken(id, token, expires) {
        await pool.query(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW() WHERE id = $3;',
            [token, expires, id]
        );
    }

    static async updatePassword(id, password_hash) {
        await pool.query(
            'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE id = $2;',
            [password_hash, id]
        );
    }

    static async updateProfile(id, { first_name, last_name, username, profile_image }) {
        const fields = [];
        const values = [];
        let index = 1;

        if (first_name !== undefined) {
            fields.push(`first_name = $${index++}`);
            values.push(first_name);
        }
        if (last_name !== undefined) {
            fields.push(`last_name = $${index++}`);
            values.push(last_name);
        }
        if (username !== undefined) {
            fields.push(`username = $${index++}`);
            values.push(username);
        }
        if (profile_image !== undefined) {
            fields.push(`profile_image = $${index++}`);
            values.push(profile_image);
        }

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE users SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING id, first_name, last_name, username, email, profile_image, email_verified, updated_at;
        `;

        const res = await pool.query(query, values);
        return res.rows[0];
    }

    static async saveSession(user_id, refresh_token, expires_at) {
        const query = `
            INSERT INTO sessions (user_id, refresh_token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const res = await pool.query(query, [user_id, refresh_token, expires_at]);
        return res.rows[0];
    }

    static async findSession(refresh_token) {
        const res = await pool.query(
            'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW();',
            [refresh_token]
        );
        return res.rows[0] || null;
    }

    static async deleteSession(refresh_token) {
        await pool.query('DELETE FROM sessions WHERE refresh_token = $1;', [refresh_token]);
    }

    static async deleteUserSessions(user_id) {
        await pool.query('DELETE FROM sessions WHERE user_id = $1;', [user_id]);
    }
}

export default UserModel;
