const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('./auth');

// Get grades for a student
router.get('/student/:id', authMiddleware, async (req, res) => {
    try {
        const [grades] = await db.promise().query(
            'SELECT * FROM calificaciones WHERE id_alumno = ?',
            [req.params.id]
        );
        res.json({ success: true, grades });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
});

// Add more grade-related routes here...

module.exports = router;  // Make sure this line exists