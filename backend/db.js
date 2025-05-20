// Importamos el módulo mysql2 para la conexión con la base de datos
const mysql2 = require('mysql2');

// Creamos la conexión con la base de datos MySQL usando los parámetros de configuración
const db = mysql2.createConnection({
    host: 'localhost',      // Dirección del servidor de base de datos
    user: 'root',          // Usuario de la base de datos
    password: '',          // Contraseña del usuario (vacía en este caso)
    database: 'boletin_digital'  // Nombre de la base de datos a la que nos conectamos
});

// Intentamos establecer la conexión con la base de datos
db.connect(err => {
    if (err) {
        // Si hay un error, lo mostramos en la consola
        console.error('Error de conexión a MySQL:', err);
    } else {
        // Si la conexión es exitosa, mostramos un mensaje de confirmación
        console.log('Conectado a MySQL');
    }
});

// Exportamos la conexión para que pueda ser utilizada en otros archivos
module.exports = db;