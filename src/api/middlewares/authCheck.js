const jwt = require('jsonwebtoken');
const config = require('../../config/config');

// Authentication middleware for dashboard (supports both admin and user roles)
function authCheck(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify token using session secret
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'default-session-secret');
        
        // Accept both admin and user roles
        if (!decoded.role || (decoded.role !== 'admin' && decoded.role !== 'user')) {
            return res.status(403).json({
                error: true,
                message: 'Access denied. Invalid role.'
            });
        }

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: 'Invalid token.'
        });
    }
}

// Admin-only middleware
function adminOnlyCheck(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify token using session secret
        const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'default-session-secret');
        
        // Check if user is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                error: true,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: true,
            message: 'Invalid token.'
        });
    }
}

// Optional authentication middleware (doesn't block if no token)
function optionalAuthCheck(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'default-session-secret');
            req.admin = decoded;
        } catch (error) {
            // Token is invalid but we don't block the request
            req.admin = null;
        }
    }
    
    next();
}

module.exports = {
    authCheck,
    adminOnlyCheck,
    optionalAuthCheck
};