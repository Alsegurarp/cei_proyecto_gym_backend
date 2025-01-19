const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const {
  crearRutina,
  leerRutinas,
  deleteRutina,
  updateRutina,
  editarStatus,
} = require('./database.js');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Configuración de la conexión a PostgreSQL con el módulo pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
}); 

// Middleware para habilitar CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:4000"],
}));

// Middleware para parsear JSON
app.use(express.json());

// Redirección de la raíz
app.get('/', (req, res) => {
  res.redirect('/rutinas');
});

// Rutas
app.get('/rutinas', async (req, res) => {
  try {
    const contenido = await leerRutinas(pool);
    res.json(contenido);
  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    res.status(500).json({ error: "error en la base de datos" });
  }
});

app.post('/rutinas/crear', async (req, res) => {
  const { nombre, descripcion, ejercicios, status } = req.body;
  try {
    const resultado = await crearRutina(pool, nombre, descripcion, ejercicios, status);
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear rutina:", error);
    res.status(500).json({ error: "error en la base de datos" });
  }
});

app.put('/rutinas/actualizar/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, ejercicios } = req.body;

  // Validar si los ejercicios están en formato de cadena JSON
  let ejerciciosParsed = ejercicios;
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
    console.error("Datos inválidos:", { id, nombre, descripcion, ejerciciosParsed });
    return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
  }

  try {
    const result = await updateRutina(pool, id, nombre, descripcion, ejerciciosParsed);
    if (result.success) {
      res.status(200).json(result); // Rutina actualizada correctamente
    } else {
      res.status(404).json(result); // Rutina no encontrada
    }
  } catch (error) {
    console.error("Error al actualizar la rutina:", error);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
});

app.put('/rutinas/editarStatus/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const resultado = await editarStatus(pool, id, status);
    res.json(resultado);
  } catch (error) {
    console.error("Error al editar estado:", error);
    res.status(500).json({ error: "error en la base de datos" });
  }
});

app.delete('/rutinas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await deleteRutina(pool, id);
    res.json(resultado);
  } catch (error) {
    console.error("Error al eliminar rutina:", error);
    res.status(500).json({ error: "error en la base de datos" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
