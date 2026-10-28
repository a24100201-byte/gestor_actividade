// Un NODO es una cajita con dos cosas: la actividad y el enlace al siguiente nodo
class Nodo {
  constructor(actividad) {
    this.actividad = actividad; // los datos (id, nombre, descripcion, estado)
    this.siguiente = null;      // null = todavía no apunta a ningún nodo
  }
}

// La LISTA solo recuerda dónde empieza (la cabeza)
class ListaEnlazada {
  constructor() {
    this.cabeza = null; // lista vacía
  }

  // REGISTRAR: agrega un nodo al final
  agregar(actividad) {
    const nuevo = new Nodo(actividad);

    if (this.cabeza === null) {
      this.cabeza = nuevo;             // si está vacía, el nuevo es el primero
    } else {
      let actual = this.cabeza;        // empezamos en el primero
      while (actual.siguiente !== null) {
        actual = actual.siguiente;     // avanzamos hasta el último nodo
      }
      actual.siguiente = nuevo;        // el último ahora apunta al nuevo
    }
  }

  // Recorre la lista buscando un id. Devuelve el nodo o null
  buscarPorId(id) {
    let actual = this.cabeza;
    while (actual !== null) {
      if (actual.actividad.id === id) {
        return actual;
      }
      actual = actual.siguiente;
    }
    return null; // llegamos al final y no estaba
  }

  // ACTUALIZAR: cambia los datos de una actividad
  actualizar(id, datos) {
    const nodo = this.buscarPorId(id);
    if (nodo === null) {
      return false; // no existe
    }
    // "...": copia lo que había y encima pone lo nuevo
    nodo.actividad = { ...nodo.actividad, ...datos };
    return true;
  }

  // CONSULTAR: convierte la lista en un arreglo normal para mandarlo al frontend
  aArreglo() {
    const resultado = [];
    let actual = this.cabeza;
    while (actual !== null) {
      resultado.push(actual.actividad);
      actual = actual.siguiente;
    }
    return resultado;
  }
}

// Esto permite usar la clase desde otro archivo con require()
module.exports = ListaEnlazada;