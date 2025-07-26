const express = require('express');
const router = express.Router();
const instanceRoutes = require('./instance.route');
const messageRoutes = require('./message.route');
const miscRoutes = require('./misc.route');
const groupRoutes = require('./group.route');
const dashboardRoutes = require('./dashboard.route');
const authRoutes = require('./auth.route');
//const managerRoutes = require('./manager.route');

router.get('/status', (req, res) => res.send('OK'));
router.get('/', (req, res) => res.redirect('/auth/login'));
router.use('/instance', instanceRoutes);
router.use('/message', messageRoutes);
router.use('/group', groupRoutes);
router.use('/misc', miscRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
//router.use('/manager', managerRoutes); // Adiciona as rotas de gerenciamento aqui

module.exports = router;
