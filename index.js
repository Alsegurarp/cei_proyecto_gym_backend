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
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


const sql = postgres(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

// Habilitar CORS
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON


app.get('/', (req, res) => {
    res.redirect('/rutinas');
});

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],
}));//solicitudes entre el frontend y el backend a través de HTTP.


// Rutas
app.get('/rutinas', async (req, res) => {
    try{
        let contenido = await leerRutinas();
        res.json(contenido);
    }catch(error){
        res.json({error: "error en la base de datos"})
        res.status(500);
    }
});

app.post('/rutinas/crear', async (req, res) => {
    let {nombre, descripcion, ejercicios, status} = req.body;
    try{
        let resultado = await crearRutina(nombre, descripcion, ejercicios, status);
        res.status(201).json(resultado);
    }catch(error){
        res.json({error: "error en la base de datos"})
        res.status(500).json(error);
    }
});

app.put("/rutinas/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, ejercicios } = req.body;
    console.log("Datos recibidos en el backend:", req.body);

    // Validar si los ejercicios están en formato de cadena JSON
    let ejerciciosParsed = ejercicios[0];
    if (typeof ejercicios === "string") {
        try {
            // Intentamos parsear los ejercicios si vienen como una cadena
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
        const result = await updateRutina(id, nombre, descripcion, ejerciciosParsed);

        if (result.success) {
            return res.status(200).json(result); // Rutina actualizada correctamente
        } else {
            return res.status(404).json(result); // Rutina no encontrada
        }
    } catch (error) {
        console.error("Error al actualizar la rutina:", error);
        return res.status(500).json({ success: false, error: "Error en la base de datos" });
    }
});


app.put('/rutinas/editarStatus/:id', async (req, res) => {
    const { id } = req.params;
    let {status} = req.body;
    try {
        const resultado = await editarStatus(id, status);
        res.json(resultado);
    } catch (error) {
        res.json({error: "error en la base de datos"})
        res.status(500).json(error);
    }
});

app.delete('/rutinas/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const resultado = await deleteRutina(id);
      res.json(resultado);
    } catch (error) {
      res.status(500).json(error);
    }
  });
  
// Iniciar el servidor

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});