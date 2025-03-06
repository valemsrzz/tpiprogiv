const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const router = express.Router();

// 🔹 Cargar notas (Solo Departamento de Alumnado)
router.post('/cargar', async (req, res) => {
    const { estudiante_id, materia_id, division, nota_1, nota_2, nota_final } = req.body;

    try {
        await pool.query(
            "INSERT INTO calificaciones (estudiante_id, materia_id, division, nota_1, nota_2, nota_final) VALUES (?, ?, ?, ?, ?, ?)",
            [estudiante_id, materia_id, division, nota_1, nota_2, nota_final]
        );

        // 📂 Guardar en archivo por división
        const dirPath = path.join(__dirname, `../boletin/7mo Año/${division}`);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

        const [estudiante] = await pool.query("SELECT nombre, apellido FROM usuarios WHERE id = ?", [estudiante_id]);
        const estudianteNombre = `${estudiante[0].apellido}${estudiante[0].nombre}.json`;
        const filePath = path.join(dirPath, estudianteNombre);

        const data = { estudiante_id, materia_id, division, notas: { nota_1, nota_2, nota_final } };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        res.json({ message: "Notas cargadas correctamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Obtener notas de un estudiante
router.get('/:estudiante_id', async (req, res) => {
    const { estudiante_id } = req.params;

    try {
        const [notas] = await pool.query(
            "SELECT m.nombre AS materia, c.nota_1, c.nota_2, c.nota_final, c.division FROM calificaciones c JOIN materias m ON c.materia_id = m.id WHERE c.estudiante_id = ?",
            [estudiante_id]
        );
        res.json(notas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
