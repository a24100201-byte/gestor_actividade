const express = require('express');   // el servidor
const fs = require('fs');             // para leer/escribir archivos
const path = require('path');         // para armar rutas de carpetas
const ListaEnlazada = require('./listaEnlazada');

const app = express();
const PORT = process.env.PORT || 3000;
const RUTA_TXT = path.join(__dirname, 'data', 'actividades.txt');
const ESTADOS_VALIDOS = ['Pendiente', 'En proceso', 'Terminada'];

const lista = new ListaEnlazada(); // la lista vive en memoria mientras corre el servidor
let siguienteId = 1;               // contador para dar un id único a cada actividad

// ---------- Archivo .txt ----------

// Al arrancar: lee el .txt y mete cada línea como nodo en la lista
function cargarDesdeArchivo() {
  if (!fs.existsSync(RUTA_TXT)) return; // si no existe el archivo, no hay nada que cargar

  const contenido = fs.readFileSync(RUTA_TXT, 'utf-8');
  const lineas = contenido.split('\n').filter(l => l.trim() !== ''); // quita líneas vacías

  lineas.forEach(linea => {
    const actividad = JSON.parse(linea); // cada línea es una actividad en formato JSON
    lista.agregar(actividad);
    if (actividad.id >= siguienteId) {
      siguienteId = actividad.id + 1;    // seguimos contando después del id más alto
    }
  });
}

// Después de cada cambio: escribe toda la lista en el .txt (una actividad por línea)
function guardarEnArchivo() {
  const texto = lista.aArreglo().map(a => JSON.stringify(a)).join('\n');
  fs.writeFileSync(RUTA_TXT, texto, 'utf-8');
}

// ---------- Configuración ----------

app.use(express.json()); // permite leer los datos JSON que manda el frontend
// Hace que el servidor también muestre la carpeta Frontend (así se abre en localhost)
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// ---------- Rutas ----------

// CONSULTAR: devuelve todas las actividades
app.get('/api/actividades', (req, res) => {
  res.json(lista.aArreglo());
});

// REGISTRAR: crea una actividad nueva
app.post('/api/actividades', (req, res) => {
  const { nombre, descripcion, estado } = req.body;

  if (!nombre || !descripcion || !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Datos incompletos o estado inválido' });
  }

  const actividad = { id: siguienteId++, nombre, descripcion, estado };
  lista.agregar(actividad);
  guardarEnArchivo();
  res.status(201).json(actividad);
});

// ACTUALIZAR: cambia nombre, descripción y/o estado de una actividad
app.put('/api/actividades/:id', (req, res) => {
  const id = Number(req.params.id); // el id viene en la URL como texto

  // Solo aceptamos estos tres campos, nunca el id
  const datos = {};
  if (req.body.nombre) datos.nombre = req.body.nombre;
  if (req.body.descripcion) datos.descripcion = req.body.descripcion;
  if (req.body.estado) {
    if (!ESTADOS_VALIDOS.includes(req.body.estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    datos.estado = req.body.estado;
  }

  const encontrada = lista.actualizar(id, datos);
  if (!encontrada) {
    return res.status(404).json({ error: 'Actividad no encontrada' });
  }

  guardarEnArchivo();
  res.json({ mensaje: 'Actividad actualizada' });
});

// ---------- Arranque ----------

cargarDesdeArchivo();
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});