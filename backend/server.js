import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initializeDatabase } from './database/initDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiter for API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/users', userRoutes);

// Root Health Check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Keeper App API Server is running smoothly.' });
});

// Error Handling Middleware
app.use(errorHandler);

// Initialize Database & Start Server
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (0.0.0.0)`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
