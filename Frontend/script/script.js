const API = '/api/actividades';  // la dirección del servidor
const ESTADOS = ['Pendiente', 'En proceso', 'Terminada'];

// Buscamos los elementos del HTML por su id
const form = document.getElementById('formActividad');
const tabla = document.getElementById('tablaActividades');

// CONSULTAR: pide las actividades al servidor y las muestra
async function cargarActividades() {
  const respuesta = await fetch(API);          // "fetch" hace la petición
  const actividades = await respuesta.json();  // convierte la respuesta a objetos
  mostrarActividades(actividades);
}

// Dibuja una fila por cada actividad
function mostrarActividades(actividades) {
  tabla.innerHTML = ''; // limpia la tabla antes de dibujar

  actividades.forEach(act => {
    const fila = document.createElement('tr');

    const tdNombre = document.createElement('td');
    tdNombre.textContent = act.nombre;

    const tdDescripcion = document.createElement('td');
    tdDescripcion.textContent = act.descripcion;

    // Celda del estado: una lista desplegable para cambiarlo
    const tdEstado = document.createElement('td');
    const select = document.createElement('select');
    ESTADOS.forEach(estado => {
      const opcion = document.createElement('option');
      opcion.value = estado;
      opcion.textContent = estado;
      if (estado === act.estado) opcion.selected = true; // marca el estado actual
      select.appendChild(opcion);
    });
    // Cuando el usuario cambia el estado, se lo mandamos al servidor
    select.addEventListener('change', () => {
      actualizarActividad(act.id, { estado: select.value });
    });
    tdEstado.appendChild(select);

    // Celda de acciones: botón para editar nombre y descripción
    const tdAcciones = document.createElement('td');
    const botonEditar = document.createElement('button');
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => {
      const nombre = prompt('Nuevo nombre:', act.nombre);
      const descripcion = prompt('Nueva descripción:', act.descripcion);
      if (nombre && descripcion) {
        actualizarActividad(act.id, { nombre, descripcion });
      }
    });
    tdAcciones.appendChild(botonEditar);

    // Armamos la fila con sus celdas y la metemos en la tabla
    fila.append(tdNombre, tdDescripcion, tdEstado, tdAcciones);
    tabla.appendChild(fila);
  });
}

// ACTUALIZAR: manda los cambios al servidor y vuelve a cargar la lista
async function actualizarActividad(id, datos) {
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  cargarActividades();
}

// REGISTRAR: cuando se envía el formulario
form.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // evita que la página se recargue sola

  const actividad = {
    nombre: document.getElementById('nombre').value,
    descripcion: document.getElementById('descripcion').value,
    estado: document.getElementById('estado').value
  };

  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(actividad)
  });

  form.reset();        // limpia el formulario
  cargarActividades(); // refresca la tabla
});

// Al abrir la página, carga lo que ya estaba guardado
cargarActividades();