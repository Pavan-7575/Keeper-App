import pool from '../config/db.js';

class OAuthModel {
    static async findOAuthAccount(provider, provider_user_id) {
        const sql = `
            SELECT oa.*, u.id AS user_id, u.first_name, u.last_name, u.username, u.email
            FROM oauth_accounts oa
            JOIN users u ON oa.user_id = u.id
            WHERE oa.provider = $1 AND oa.provider_user_id = $2;
        `;
        const res = await pool.query(sql, [provider, provider_user_id]);
        return res.rows[0] || null;
    }

    static async linkOAuthAccount(userId, provider, provider_user_id) {
        const sql = `
            INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (provider, provider_user_id) DO NOTHING
            RETURNING *;
        `;
        const res = await pool.query(sql, [userId, provider, provider_user_id]);
        return res.rows[0];
    }
}

export default OAuthModel;
