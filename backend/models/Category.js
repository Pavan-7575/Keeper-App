import pool from '../config/db.js';

class CategoryModel {
    static async createCategory(userId, name) {
        const query = `
            INSERT INTO categories (user_id, name)
            VALUES ($1, $2)
            ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
            RETURNING *;
        `;
        const res = await pool.query(query, [userId, name]);
        return res.rows[0];
    }

    static async getCategories(userId) {
        const res = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1 ORDER BY name ASC;',
            [userId]
        );
        return res.rows;
    }

    static async deleteCategory(userId, categoryId) {
        await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2;', [categoryId, userId]);
    }
}

export default CategoryModel;
