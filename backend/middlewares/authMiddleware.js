import { verifyAccessToken } from '../utils/jwtUtils.js';
import { sendError } from '../utils/responseUtils.js';

export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token && req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return sendError(res, 401, 'Access denied. Token missing or unauthenticated.');
        }

        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 401, 'Access token has expired. Please refresh your token.', { code: 'TOKEN_EXPIRED' });
        }
        return sendError(res, 403, 'Invalid or malformed authentication token.');
    }
};
