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

// Updated PostgreSQL connection with correct SSL configuration for Render
const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
});

// Rest of your existing CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:4000"],
}));

app.use(express.json());

// Your existing routes
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

// Rest of your routes remain the same...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add error handling for unexpected server errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});