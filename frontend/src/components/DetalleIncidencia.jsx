import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { CATEGORIAS, ESTADOS, formatoFecha } from '../utils'
import { InsigniaAlerta } from './TarjetaIncidencia'

// Vista de detalle con el historial de comentarios de una incidencia.
export default function DetalleIncidencia({ incidencia, onCerrar, onCambio }) {
  const [comentarios, setComentarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [autor, setAutor] = useState('')
  const [texto, setTexto] = useState('')
  const [errorTexto, setErrorTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      setComentarios(await api.comentarios(incidencia.id))
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [incidencia.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function enviar(e) {
    e.preventDefault()
    if (!texto.trim()) {
      setErrorTexto('Escribe un comentario antes de enviar.')
      return
    }
    setErrorTexto('')
    setEnviando(true)
    try {
      await api.comentar(incidencia.id, { autor: autor.trim(), texto })
      setTexto('')
      await cargar()
      onCambio() // refresca contador de comentarios en la lista
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecera">
          <h2>{incidencia.titulo}</h2>
          <button onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className="insignias">
          <InsigniaAlerta alerta={incidencia.alerta} />
          <span className={`prioridad ${incidencia.prioridad}`}>{incidencia.prioridad}</span>
          <span className="estado-chip">{ESTADOS[incidencia.estado]}</span>
        </div>
        <p>{incidencia.descripcion}</p>

        <dl className="datos">
          <div><dt>Categoría</dt><dd>{CATEGORIAS[incidencia.categoria]}</dd></div>
          <div><dt>Responsable</dt><dd>{incidencia.responsable || 'Sin asignar'}</dd></div>
          <div><dt>Ubicación</dt><dd>{incidencia.ubicacion || '—'}</dd></div>
          <div><dt>Aula</dt><dd>{incidencia.aula || '—'}</dd></div>
          <div><dt>Fecha límite</dt><dd>{formatoFecha(incidencia.fecha_limite)}</dd></div>
          <div><dt>Creada</dt><dd>{formatoFecha(incidencia.creado_en)}</dd></div>
        </dl>

        <h3>Historial de comentarios</h3>
        {error && <p className="error" role="alert">{error}</p>}
        {cargando && <p className="vacio">Cargando comentarios…</p>}
        {!cargando && comentarios.length === 0 && !error && (
          <p className="vacio">Aún no hay comentarios.</p>
        )}
        <ul className="historial">
          {comentarios.map((c) => (
            <li key={c.id}>
              <div className="historial-meta">
                <strong>{c.autor || 'Anónimo'}</strong>
                <span>{formatoFecha(c.creado_en)}</span>
              </div>
              <p>{c.texto}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={enviar} noValidate className="form-comentario">
          <input value={autor} maxLength="80" onChange={(e) => setAutor(e.target.value)} placeholder="Tu nombre (opcional)" />
          <textarea rows="3" value={texto} onChange={(e) => { setTexto(e.target.value); setErrorTexto('') }} placeholder="Escribe una novedad o acción realizada…" />
          {errorTexto && <span className="error-campo">{errorTexto}</span>}
          <button className="principal" type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Agregar comentario'}
          </button>
        </form>
      </div>
    </div>
  )
}
