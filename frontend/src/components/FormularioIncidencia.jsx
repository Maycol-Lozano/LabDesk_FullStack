import { useState } from 'react'
import { CATEGORIAS, ESTADOS, PRIORIDADES } from '../utils'

function Campo({ etiqueta, error, children }) {
  return (
    <label>
      {etiqueta}
      {children}
      {error && <span className="error-campo">{error}</span>}
    </label>
  )
}

// Validación en el navegador antes de llamar a la API.
function validar(form) {
  const errores = {}
  if (!form.titulo.trim()) errores.titulo = 'El título es obligatorio.'
  if (!form.descripcion.trim()) errores.descripcion = 'La descripción es obligatoria.'
  if (form.titulo.length > 120) errores.titulo = 'Máximo 120 caracteres.'
  return errores
}

export default function FormularioIncidencia({ form, setForm, editando, guardando, errorServidor, onGuardar, onCancelar }) {
  const [errores, setErrores] = useState({})

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errores[e.target.name]) setErrores({ ...errores, [e.target.name]: undefined })
  }

  const enviar = (e) => {
    e.preventDefault()
    const encontrados = validar(form)
    setErrores(encontrados)
    if (Object.keys(encontrados).length === 0) onGuardar()
  }

  const cancelar = () => {
    setErrores({})
    onCancelar()
  }

  return (
    <section className="panel">
      <h2>{editando === null ? 'Nueva incidencia' : `Editar incidencia #${editando}`}</h2>
      <form onSubmit={enviar} noValidate>
        <Campo etiqueta="Título *" error={errores.titulo}>
          <input name="titulo" maxLength="120" value={form.titulo} onChange={cambiar} placeholder="PC no enciende" />
        </Campo>
        <Campo etiqueta="Descripción *" error={errores.descripcion}>
          <textarea name="descripcion" rows="3" value={form.descripcion} onChange={cambiar} placeholder="Describe el problema..." />
        </Campo>

        <div className="fila-2">
          <Campo etiqueta="Categoría">
            <select name="categoria" value={form.categoria} onChange={cambiar}>
              {Object.entries(CATEGORIAS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Prioridad">
            <select name="prioridad" value={form.prioridad} onChange={cambiar}>
              {Object.entries(PRIORIDADES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </Campo>
        </div>

        <Campo etiqueta="Estado">
          <select name="estado" value={form.estado} onChange={cambiar}>
            {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </Campo>

        <Campo etiqueta="Responsable">
          <input name="responsable" maxLength="80" value={form.responsable} onChange={cambiar} placeholder="Nombre del técnico" />
        </Campo>
        <div className="fila-2">
          <Campo etiqueta="Ubicación">
            <input name="ubicacion" maxLength="100" value={form.ubicacion} onChange={cambiar} placeholder="Laboratorio 2, puesto 5" />
          </Campo>
          <Campo etiqueta="Aula">
            <input name="aula" maxLength="40" value={form.aula} onChange={cambiar} placeholder="Aula 2" />
          </Campo>
        </div>
        <Campo etiqueta="Fecha límite de atención">
          <input type="datetime-local" name="fecha_limite" value={form.fecha_limite} onChange={cambiar} />
        </Campo>

        {errorServidor && <p className="error" role="alert">{errorServidor}</p>}

        <button className="principal" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : editando === null ? 'Registrar' : 'Guardar cambios'}
        </button>
        {editando !== null && (
          <button type="button" onClick={cancelar} disabled={guardando}>Cancelar edición</button>
        )}
      </form>
    </section>
  )
}
