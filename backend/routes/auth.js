const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);

const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
};

const adminMiddleware = (req, res, next) => {
    const role = req.session.user?.rol?.toLowerCase();
    if (!role || (role !== 'admin' && role !== 'administrador')) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    router
};