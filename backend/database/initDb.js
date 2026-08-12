import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with override: true
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.PGHOST || 'localhost';
const port = parseInt(process.env.PGPORT || '5432', 10);
const user = process.env.PGUSER || 'postgres';
const password = process.env.PGPASSWORD || 'postgres';
const targetDatabase = process.env.PGDATABASE || 'keeper_db';

export const initializeDatabase = async () => {
    try {
        if (process.env.DATABASE_URL) {
            const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
            const schemaPath = path.join(__dirname, 'schema.sql');
            const sql = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(sql);
            console.log('✅ Cloud PostgreSQL Schema initialized successfully');
            await pool.end();
            return;
        }

        console.log(`📡 Connecting to PostgreSQL at ${host}:${port} as user '${user}'...`);
        const sysClient = new pg.Client({
            host,
            port,
            user,
            password,
            database: 'postgres',
        });

        await sysClient.connect();

        const res = await sysClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1;",
            [targetDatabase]
        );

        if (res.rows.length === 0) {
            console.log(`🔨 Database '${targetDatabase}' does not exist. Creating database...`);
            await sysClient.query(`CREATE DATABASE "${targetDatabase}";`);
            console.log(`✅ Database '${targetDatabase}' created successfully.`);
        } else {
            console.log(`ℹ️ Database '${targetDatabase}' already exists.`);
        }

        await sysClient.end();

        const targetPool = new pg.Pool({
            host,
            port,
            user,
            password,
            database: targetDatabase,
        });

        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await targetPool.query(sql);
        console.log(`✅ PostgreSQL Schema tables initialized successfully inside '${targetDatabase}'!`);
        await targetPool.end();
    } catch (error) {
        console.error('❌ Database schema initialization error:', error.message);
    }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initializeDatabase().then(() => process.exit(0));
}
