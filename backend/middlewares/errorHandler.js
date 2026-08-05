import { sendError } from '../utils/responseUtils.js';

export const errorHandler = (err, req, res, next) => {
    console.error('🔥 Server Error Stack:', err.stack || err);

    if (err.name === 'UnauthorizedError') {
        return sendError(res, 401, 'Unauthorized request.');
    }

    if (err.message && err.message.includes('Only image files')) {
        return sendError(res, 400, err.message);
    }

    return sendError(
        res,
        err.status || 500,
        process.env.NODE_ENV === 'production' ? 'Internal server error occurred.' : err.message || 'Server Error'
    );
};
