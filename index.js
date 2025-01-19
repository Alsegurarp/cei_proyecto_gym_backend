import express from 'express';
import {
  crearRutina,
  leerRutinas,
  deleteRutina,
  updateRutina,
  editarStatus
} from './database.js';
import cors from 'cors';
import postgres from 'postgres';  
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Updated PostgreSQL connection configuration for Render deployment
const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: true,
    require: true
  } : false,
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
});

// Updated CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend domain
    : ['http://localhost:3000', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Rest of your routes remain the same
app.get('/', (req, res) => {
  res.redirect('/rutinas');
});

app.get('/rutinas', async (req, res) => {
  try {
    let contenido = await leerRutinas(sql);
    res.json(contenido);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

app.post('/rutinas/crear', async (req, res) => {
  let { nombre, descripcion, ejercicios, status } = req.body;
  try {
    let resultado = await crearRutina(sql, nombre, descripcion, ejercicios, status);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

app.put("/rutinas/actualizar/:id", async (req, res) => {
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
      return res.status(400).json({ error: "Formato de ejercicios no válido" });
    }
  }

  if (!id || !nombre || !descripcion || !ejerciciosParsed) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const result = await updateRutina(sql, id, nombre, descripcion, ejerciciosParsed);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: "Error en la base de datos" });
  }
});

app.put('/rutinas/editarStatus/:id', async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;
  try {
    const resultado = await editarStatus(sql, id, status);
    res.json(resultado);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json(error);
  }
});

app.delete('/rutinas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await deleteRutina(sql, id);
    res.json(resultado);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});