const express = require('express');
const path = require('path');
const { authCheck } = require('../middlewares/authCheck');

const router = express.Router();

// Serve dashboard HTML (no auth required - JS handles auth check)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

// Serve dashboard with /dashboard path as well (no auth required - JS handles auth check)
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

module.exports = router;