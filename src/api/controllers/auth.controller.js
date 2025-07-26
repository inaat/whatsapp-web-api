const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Function to get instances list
const getInstances = () => {
    try {
        const sessionsPath = path.join(__dirname, '../../../db/sessions.json');
        if (fs.existsSync(sessionsPath)) {
            const data = fs.readFileSync(sessionsPath, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error reading sessions:', error);
        return [];
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        // Check for admin login
        const adminUsername = process.env.ADMIN_USER || 'admin';
        const adminPassword = process.env.PASSWORD || 'adminpass';

        let userRole = 'user';
        let validCredentials = false;

        console.log('DEBUG: Environment check', {
            envADMIN_USER: process.env.ADMIN_USER,
            envPASSWORD: process.env.PASSWORD,
            adminUsername,
            adminPassword
        });

        // Check admin credentials first
        if (username === adminUsername && password === adminPassword) {
            validCredentials = true;
            userRole = 'admin';
            console.log('DEBUG: Admin login successful');
        } else {
            console.log('DEBUG: Admin login failed - checking instances');
            // Check if username is an instance key with password "password"
            const instances = getInstances();
            const instanceExists = instances.some(instance => instance.key === username);
            
            if (instanceExists && password === 'password') {
                validCredentials = true;
                userRole = 'user';
                console.log('DEBUG: Instance login successful');
            } else {
                console.log('DEBUG: Both login methods failed');
            }
        }

        // Validate credentials
        if (!validCredentials) {
            return res.json({
                error: true,
                message: 'Invalid username or password'
            });
        }

        // Generate JWT token
        const tokenPayload = {
            username: username,
            role: userRole,
            loginTime: Date.now()
        };

        const tokenOptions = {
            expiresIn: rememberMe ? '30d' : '24h'
        };

        const token = jwt.sign(
            tokenPayload, 
            process.env.SESSION_SECRET || 'default-session-secret',
            tokenOptions
        );

        res.json({
            error: false,
            message: 'Login successful',
            token: token,
            user: {
                username: username,
                role: userRole
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
};

// Logout controller
exports.logout = async (req, res) => {
    try {
        // In a real application, you might want to maintain a blacklist of tokens
        // For now, we'll just return success and let the client handle token removal
        res.json({
            error: false,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
};

// Verify token controller
exports.verify = async (req, res) => {
    try {
        // If we reach this point, the token is valid (middleware verified it)
        const { user } = req;
        
        res.json({
            error: false,
            message: 'Token is valid',
            user: {
                username: user.username,
                role: user.role,
                loginTime: user.loginTime
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
};

// Get current user info
exports.me = async (req, res) => {
    try {
        const { user } = req;
        
        res.json({
            error: false,
            user: {
                username: user.username,
                role: user.role,
                loginTime: user.loginTime
            }
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
};