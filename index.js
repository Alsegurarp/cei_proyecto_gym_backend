import express from 'express';
import {
  crearRutina,
  leerRutinas,
  deleteRutina,
  updateRutina,
  editarStatus
} from './database.js';
import cors from 'cors';
import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Updated PostgreSQL connection for Render
function conectar() {
    return postgres({
        host: 'dpg-cu6iikrtq21c7387r370-a.frankfurt-postgres.render.com',
        database: 'base_de_datos_gym_cei',
        username: 'base_de_datos_gym_cei_user',
        password: 'Q7x0AgXV3DEaVQ4RB5gHDiBaGfvkhLWp',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        },
    });
}

// CORS configuration
app.use(cors({
    origin: ["http://localhost:3000", "https://cei-proyecto-gym-backend.onrender.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware for parsing JSON
app.use(express.json());

// Default route
app.get('/', (req, res) => {
    res.redirect('/rutinas');
});

// Routes
app.get('/rutinas', async (req, res) => {
    let conexion = null;
    try {
        conexion = conectar();
        let contenido = await leerRutinas();
        res.json(contenido);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error en la base de datos" });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.post('/rutinas/crear', async (req, res) => {
    let conexion = null;
    const { nombre, descripcion, ejercicios, status } = req.body;
    try {
        conexion = conectar();
        let resultado = await crearRutina(nombre, descripcion, ejercicios, status);
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error en la base de datos" });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.put("/rutinas/actualizar/:id", async (req, res) => {
    let conexion = null;
    const { id } = req.params;
    const { nombre, descripcion, ejercicios } = req.body;
    
    let ejerciciosParsed = ejercicios[0];
    if (typeof ejercicios === "string") {
        try {
            ejerciciosParsed = JSON.parse(ejercicios);
            if (!Array.isArray(ejerciciosParsed)) {
                throw new Error("Ejercicios no son un array válido");
            }
        } catch (error) {
            console.error("Error al parsear ejercicios:", error);
            return res.status(400).json({ success: false, error: "Formato de ejercicios no válido" });
        }
    }

    if (!id || !nombre || !descripcion || !ejerciciosParsed) {
        return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    try {
        conexion = conectar();
        const result = await updateRutina(id, nombre, descripcion, ejerciciosParsed);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("Error al actualizar la rutina:", error);
        res.status(500).json({ success: false, error: "Error en la base de datos" });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.put('/rutinas/editarStatus/:id', async (req, res) => {
    let conexion = null;
    const { id } = req.params;
    const { status } = req.body;
    try {
        conexion = conectar();
        const resultado = await editarStatus(id, status);
        res.json(resultado);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error en la base de datos" });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

app.delete('/rutinas/:id', async (req, res) => {
    let conexion = null;
    const { id } = req.params;
    try {
        conexion = conectar();
        const resultado = await deleteRutina(id);
        res.json(resultado);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: "Error en la base de datos" });
    } finally {
        if (conexion) {
            await conexion.end();
        }
    }
});

// Start server with proper port binding for Render
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});