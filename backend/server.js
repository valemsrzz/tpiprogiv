const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const db = require('./db');

// Environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Add register route
app.get('/registrouser.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registrouser.html'));
});

// Routes
const authRoutes = require('./routes/authRoutes');
const gradesRoutes = require('./routes/grades');
const userRoutes = require('./routes/users');
app.use('/api/auth', authRoutes); 
app.use('/api/grades', gradesRoutes);
app.use('/api/users', userRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error en el servidor',
        message: NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = db;