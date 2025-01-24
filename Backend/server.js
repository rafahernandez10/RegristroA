import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcryptjs'; // Importar bcryptjs correctamente
import jwt from 'jsonwebtoken'; // Importar jsonwebtoken correctamente
import chalk from 'chalk';

const { Pool } = pkg;
const app = express();
const port = 3001;
const SECRET_KEY = 'mi_secreto'; // Cambia esto por una clave secreta más segura

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Asistencia',
    password: '123',
    port: 5432,
});

// Registro de escuela
app.post('/register', async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10); // Encriptar la contraseña
        await pool.query(
            'INSERT INTO escuelas (nombre, correo, contrasena) VALUES ($1, $2, $3)',
            [nombre, correo, hashedPassword]
        );
        res.status(201).json({ message: 'Escuela registrada con éxito' });
    } catch (error) {
        console.error(chalk.red('Error al registrar escuela:', error.stack));
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Inicio de sesión
app.post('/login', async (req, res) => {
    const { nombre, contrasena } = req.body;
    try {
        const result = await pool.query('SELECT * FROM escuelas WHERE nombre = $1', [nombre]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Escuela no encontrada' });
        }
        const escuela = result.rows[0];
        const isMatch = await bcrypt.compare(contrasena, escuela.contrasena); // Comparar la contraseña encriptada
        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }
        const token = jwt.sign({ id: escuela.id, nombre: escuela.nombre }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error(chalk.red('Error al iniciar sesión:', error.stack));
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Obtener profesores de la escuela
app.get('/profesores', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const result = await pool.query('SELECT nombre, rol FROM profesores WHERE escuela_id = $1', [decoded.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(chalk.red('Error al obtener profesores:', error.stack));
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(port, () => {
    console.log(chalk.cyan(`Servidor en ejecución en el puerto ${port}`));
});
