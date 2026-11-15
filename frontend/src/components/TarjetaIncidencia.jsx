import { CATEGORIAS, ESTADOS, formatoFecha } from '../utils'

export function InsigniaAlerta({ alerta }) {
  if (alerta === 'vencida') return <span className="alerta alerta-vencida">Vencida</span>
  if (alerta === 'proxima') return <span className="alerta alerta-proxima">Próxima a vencer</span>
  return null
}

export default function TarjetaIncidencia({ item, onEstado, onEditar, onEliminar, onDetalle }) {
  return (
    <article className={`incidencia ${item.alerta ? `con-${item.alerta}` : ''}`}>
      <div className="item-top">
        <h3>{item.titulo}</h3>
        <div className="insignias">
          <InsigniaAlerta alerta={item.alerta} />
          <span className={`prioridad ${item.prioridad}`}>{item.prioridad}</span>
        </div>
      </div>
      <p>{item.descripcion}</p>
      <div className="item-meta">
        <span>{CATEGORIAS[item.categoria]}</span>
        <span>ID #{item.id}</span>
        {item.responsable && <span>👤 {item.responsable}</span>}
        {item.ubicacion && <span>📍 {item.ubicacion}</span>}
        {item.aula && <span>Aula: {item.aula}</span>}
        {item.fecha_limite && <span>⏰ {formatoFecha(item.fecha_limite)}</span>}
        <span>💬 {item.total_comentarios}</span>
      </div>
      <div className="item-acciones">
        <select aria-label="Cambiar estado" value={item.estado} onChange={(e) => onEstado(item.id, e.target.value)}>
          {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
        <button onClick={() => onDetalle(item)}>Detalle y comentarios</button>
        <button onClick={() => onEditar(item)}>Editar</button>
        <button className="peligro" onClick={() => onEliminar(item.id)}>Eliminar</button>
      </div>
    </article>
  )
}
