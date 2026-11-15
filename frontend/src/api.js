// Capa de acceso a la API de Django. Todo el frontend usa estas funciones.
const BASE = 'http://127.0.0.1:8000/api/incidencias/'

// Convierte los errores de DRF ({campo: ['mensaje']}) en un texto legible.
function textoDeError(datos, estado) {
  if (!datos || typeof datos !== 'object') {
    return `El servidor respondió con error ${estado}.`
  }
  if (typeof datos.detail === 'string') return datos.detail
  return Object.entries(datos)
    .map(([campo, msgs]) => `${campo}: ${[].concat(msgs).join(' ')}`)
    .join(' · ')
}

async function pedir(url, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
  } catch {
    throw new Error(
      'No se pudo conectar con Django. Verifica que el servidor esté encendido en el puerto 8000.',
    )
  }
  if (respuesta.status === 204) return null
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    /* respuesta sin JSON */
  }
  if (!respuesta.ok) {
    const error = new Error(textoDeError(datos, respuesta.status))
    error.campos = datos && typeof datos === 'object' ? datos : {}
    throw error
  }
  return datos
}

const enviar = (metodo, cuerpo) => ({ method: metodo, body: JSON.stringify(cuerpo) })

export const api = {
  listar: () => pedir(BASE),
  crear: (datos) => pedir(BASE, enviar('POST', datos)),
  actualizar: (id, datos) => pedir(`${BASE}${id}/`, enviar('PUT', datos)),
  cambiarEstado: (id, estado) => pedir(`${BASE}${id}/`, enviar('PATCH', { estado })),
  eliminar: (id) => pedir(`${BASE}${id}/`, { method: 'DELETE' }),
  estadisticas: () => pedir(`${BASE}estadisticas/`),
  comentarios: (id) => pedir(`${BASE}${id}/comentarios/`),
  comentar: (id, datos) => pedir(`${BASE}${id}/comentarios/`, enviar('POST', datos)),
}
