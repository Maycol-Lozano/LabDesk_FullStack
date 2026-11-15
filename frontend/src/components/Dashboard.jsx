// Indicadores calculados por Django (endpoint /api/incidencias/estadisticas/).
export default function Dashboard({ stats, cargando }) {
  if (!stats) {
    return (
      <section className="panel dashboard">
        <p className="vacio">{cargando ? 'Cargando indicadores…' : 'Sin indicadores disponibles.'}</p>
      </section>
    )
  }

  const { total, por_estado, por_prioridad, vencidas, proximas_a_vencer, porcentaje_resolucion } = stats
  const maxPrioridad = Math.max(1, ...Object.values(por_prioridad))

  return (
    <section className="dashboard" aria-label="Dashboard">
      <div className="estadisticas">
        <div className="kpi"><strong>{total}</strong><span>Total</span></div>
        <div className="kpi"><strong>{por_estado.pendiente}</strong><span>Pendientes</span></div>
        <div className="kpi"><strong>{por_estado.en_proceso}</strong><span>En proceso</span></div>
        <div className="kpi"><strong>{por_estado.resuelto}</strong><span>Resueltas</span></div>
        <div className="kpi kpi-rojo"><strong>{vencidas}</strong><span>Vencidas</span></div>
        <div className="kpi kpi-ambar"><strong>{proximas_a_vencer}</strong><span>Próximas a vencer</span></div>
      </div>

      <div className="dashboard-detalle">
        <div className="panel">
          <h2>Porcentaje de resolución</h2>
          <p className="porcentaje">{porcentaje_resolucion} %</p>
          <div className="barra" role="progressbar" aria-valuenow={porcentaje_resolucion} aria-valuemin="0" aria-valuemax="100">
            <div className="barra-relleno" style={{ width: `${porcentaje_resolucion}%` }} />
          </div>
          <small>{por_estado.resuelto} resueltas de {total}</small>
        </div>

        <div className="panel">
          <h2>Distribución por prioridad</h2>
          {['alta', 'media', 'baja'].map((p) => (
            <div className="fila-prioridad" key={p}>
              <span className="nombre-prio">{p}</span>
              <div className="barra">
                <div
                  className={`barra-relleno prio-${p}`}
                  style={{ width: `${(por_prioridad[p] / maxPrioridad) * 100}%` }}
                />
              </div>
              <strong>{por_prioridad[p]}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
