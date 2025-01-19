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

// Crear la conexión a la base de datos con SSL habilitado
const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false, // Esto permite la conexión aunque no se verifique el certificado
  },
});

// Habilitar CORS
app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.redirect('/rutinas');
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:4000"],
}));

// Rutas
app.get('/rutinas', async (req, res) => {
  try {
    let contenido = await leerRutinas(sql);  // Asegúrate de pasar la conexión
    res.json(contenido);
  } catch (error) {
    res.status(500).json({ error: "error en la base de datos" });
  }
});

app.post('/rutinas/crear', async (req, res) => {
  let { nombre, descripcion, ejercicios, status } = req.body;
  try {
    let resultado = await crearRutina(sql, nombre, descripcion, ejercicios, status); // Pasar la conexión
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "error en la base de datos" });
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
    res.status(500).json(error);
  }
});

app.delete('/rutinas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await deleteRutina(sql, id);
    res.json(resultado);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
