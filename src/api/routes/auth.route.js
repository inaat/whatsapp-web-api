const express = require('express');
const controller = require('../controllers/auth.controller');
const { authCheck } = require('../middlewares/authCheck');
const path = require('path');

const router = express.Router();

// Serve login page (must come first to avoid conflicts)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
});

// Login route
router.post('/login', controller.login);

// Logout route (requires authentication)
router.post('/logout', authCheck, controller.logout);

// Token verification route (requires authentication)
router.get('/verify', authCheck, controller.verify);

// Get current user info (requires authentication)
router.get('/me', authCheck, controller.me);

module.exports = router;