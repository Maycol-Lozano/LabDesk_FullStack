import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { ESTADOS, PRIORIDADES, aInputLocal, generarCSV } from './utils'
import Dashboard from './components/Dashboard'
import FormularioIncidencia from './components/FormularioIncidencia'
import TarjetaIncidencia from './components/TarjetaIncidencia'
import DetalleIncidencia from './components/DetalleIncidencia'

const vacio = {
  titulo: '', descripcion: '', categoria: 'hardware', prioridad: 'media',
  estado: 'pendiente', aula: '', responsable: '', ubicacion: '', fecha_limite: '',
}

export default function App() {
  const [incidencias, setIncidencias] = useState([])
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [filtroAlerta, setFiltroAlerta] = useState('todas')
  const [orden, setOrden] = useState('recientes')

  const [detalleId, setDetalleId] = useState(null)

  // Recarga la lista y los indicadores desde Django.
  const cargar = useCallback(async () => {
    try {
      const [lista, indicadores] = await Promise.all([api.listar(), api.estadisticas()])
      setIncidencias(lista)
      setStats(indicadores)
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function guardar() {
    setGuardando(true)
    setErrorForm('')
    const datos = { ...form, fecha_limite: form.fecha_limite || null }
    try {
      if (editando === null) await api.crear(datos)
      else await api.actualizar(editando, datos)
      cancelar()
      await cargar()
    } catch (e) {
      setErrorForm(e.message)
    } finally {
      setGuardando(false)
    }
  }

  function editar(item) {
    setEditando(item.id)
    setErrorForm('')
    setForm({
      titulo: item.titulo, descripcion: item.descripcion, categoria: item.categoria,
      prioridad: item.prioridad, estado: item.estado, aula: item.aula || '',
      responsable: item.responsable || '', ubicacion: item.ubicacion || '',
      fecha_limite: aInputLocal(item.fecha_limite),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setEditando(null)
    setForm({ ...vacio })
    setErrorForm('')
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.cambiarEstado(id, estado)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta incidencia y todos sus comentarios?')) return
    try {
      await api.eliminar(id)
      if (editando === id) cancelar()
      if (detalleId === id) setDetalleId(null)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = incidencias.filter((i) => {
      const texto = `${i.titulo} ${i.descripcion} ${i.responsable} ${i.ubicacion}`.toLowerCase()
      return (
        texto.includes(q) &&
        (filtroEstado === 'todos' || i.estado === filtroEstado) &&
        (filtroPrioridad === 'todas' || i.prioridad === filtroPrioridad) &&
        (filtroAlerta === 'todas' || i.alerta === filtroAlerta)
      )
    })
    const fecha = (i) => new Date(i.creado_en).getTime()
    const limite = (i) => (i.fecha_limite ? new Date(i.fecha_limite).getTime() : Infinity)
    return [...lista].sort((a, b) => {
      if (orden === 'antiguas') return fecha(a) - fecha(b)
      if (orden === 'vence') return limite(a) - limite(b)
      return fecha(b) - fecha(a)
    })
  }, [incidencias, busqueda, filtroEstado, filtroPrioridad, filtroAlerta, orden])

  function exportarCSV() {
    const url = URL.createObjectURL(new Blob([generarCSV(filtradas)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'incidencias.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const detalle = incidencias.find((i) => i.id === detalleId)

  return (
    <main className="contenedor">
      <header className="encabezado">
        <div>
          <span className="eyebrow">PROYECTO FULL STACK</span>
          <h1>LabDesk 2.0</h1>
          <p>Seguimiento de incidencias del laboratorio</p>
        </div>
        <span className="api">Django API + React</span>
      </header>

      {error && (
        <p className="error" role="alert">
          {error} <button onClick={cargar}>Reintentar</button>
        </p>
      )}

      <Dashboard stats={stats} cargando={cargando} />

      <div className="columnas">
        <FormularioIncidencia
          form={form}
          setForm={setForm}
          editando={editando}
          guardando={guardando}
          errorServidor={errorForm}
          onGuardar={guardar}
          onCancelar={cancelar}
        />

        <section className="panel">
          <div className="cabecera-lista">
            <h2>Incidencias</h2>
            <span>{filtradas.length} de {incidencias.length} mostradas</span>
            <button onClick={exportarCSV} disabled={filtradas.length === 0}>Exportar CSV</button>
          </div>

          <div className="filtros">
            <input placeholder="Buscar por título, descripción, responsable…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} aria-label="Filtrar por estado">
              <option value="todos">Todos los estados</option>
              {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
            <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} aria-label="Filtrar por prioridad">
              <option value="todas">Todas las prioridades</option>
              {Object.entries(PRIORIDADES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
            <select value={filtroAlerta} onChange={(e) => setFiltroAlerta(e.target.value)} aria-label="Filtrar por alerta">
              <option value="todas">Todas las alertas</option>
              <option value="vencida">Vencidas</option>
              <option value="proxima">Próximas a vencer</option>
            </select>
            <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
              <option value="recientes">Más recientes primero</option>
              <option value="antiguas">Más antiguas primero</option>
              <option value="vence">Por fecha límite</option>
            </select>
          </div>

          <div className="lista">
            {cargando && <p className="vacio">Cargando incidencias…</p>}
            {!cargando && filtradas.length === 0 && <p className="vacio">No hay incidencias que coincidan.</p>}
            {filtradas.map((item) => (
              <TarjetaIncidencia
                key={item.id}
                item={item}
                onEstado={cambiarEstado}
                onEditar={editar}
                onEliminar={eliminar}
                onDetalle={(i) => setDetalleId(i.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {detalle && (
        <DetalleIncidencia
          incidencia={detalle}
          onCerrar={() => setDetalleId(null)}
          onCambio={cargar}
        />
      )}

      <footer>Actividad académica · Uso local · Sin autenticación</footer>
    </main>
  )
}
