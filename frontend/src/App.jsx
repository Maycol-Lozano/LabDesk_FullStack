import { useEffect, useState } from 'react'

const API = 'http://127.0.0.1:8000/api/incidencias/'
const vacio = {
  titulo: '', descripcion: '', categoria: 'hardware',
  prioridad: 'media', estado: 'pendiente', aula: ''
}

export default function App() {
  const [datos, setDatos] = useState([])
  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [orden, setOrden] = useState('recientes')
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const respuesta = await fetch(API)
      if (!respuesta.ok) throw new Error('No se pudo cargar la API')
      setDatos(await respuesta.json())
      setError('')
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { cargar() }, [])

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      const url = editando === null ? API : `${API}${editando}/`
      const metodo = editando === null ? 'POST' : 'PUT'
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!respuesta.ok) throw new Error('Verifica los campos enviados')
      cancelar()
      await cargar()
    } catch (e) { setError(e.message) }
  }

  function editar(item) {
    setEditando(item.id)
    setForm({
      titulo: item.titulo, descripcion: item.descripcion,
      categoria: item.categoria, prioridad: item.prioridad,
      estado: item.estado, aula: item.aula
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelar() {
    setEditando(null)
    setForm({ ...vacio })
  }

  async function actualizarEstado(id, estado) {
    try {
      const respuesta = await fetch(`${API}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      })
      if (!respuesta.ok) throw new Error('No se pudo cambiar el estado')
      await cargar()
    } catch (e) { setError(e.message) }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta incidencia?')) return
    try {
      const respuesta = await fetch(`${API}${id}/`, { method: 'DELETE' })
      if (!respuesta.ok) throw new Error('No se pudo eliminar')
      await cargar()
    } catch (e) { setError(e.message) }
  }

  const filtrados = datos.filter(item => {
  const texto = `${item.titulo} ${item.descripcion}`.toLowerCase()
  return texto.includes(busqueda.toLowerCase()) &&
    (filtroEstado === 'todos' || item.estado === filtroEstado) &&
    (filtroPrioridad === 'todas' || item.prioridad === filtroPrioridad)
}).sort((a, b) => orden === 'recientes'
  ? new Date(b.creado_en) - new Date(a.creado_en)
  : new Date(a.creado_en) - new Date(b.creado_en))
  
  function exportarCSV() {
  const encabezados = ['ID', 'Título', 'Descripción', 'Categoría', 'Prioridad', 'Estado', 'Aula', 'Creado en']
  
  const filas = filtrados.map(item => [
    item.id,
    `"${(item.titulo || '').replace(/"/g, '""')}"`,
    `"${(item.descripcion || '').replace(/"/g, '""')}"`,
    item.categoria,
    item.prioridad,
    item.estado,
    `"${(item.aula || '').replace(/"/g, '""')}"`,
    item.creado_en
  ].join(';')) // <-- Punto y coma para que Excel en español separe las columnas

  // '\uFEFF' agrega el BOM de UTF-8 para que Excel respete tildes y la "ñ"
  const contenidoCSV = '\uFEFF' + [encabezados.join(';'), ...filas].join('\n')
  
  const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = 'incidencias_labdesk.csv'
  enlace.click()
  URL.revokeObjectURL(url)
}

  const pendientes = datos.filter(x => x.estado === 'pendiente').length
  const resueltos = datos.filter(x => x.estado === 'resuelto').length
  const proceso = datos.filter(x => x.estado === 'en_proceso').length
  const altas = datos.filter(x => x.prioridad === 'alta').length

  return (
    <main className="contenedor">
      <header className="encabezado">
        <div><span className="eyebrow">PROYECTO FULL STACK</span>
          <h1>LabDesk</h1><p>Gestión de incidencias del laboratorio</p>
        </div>
        <span className="api">Django API + React</span>
      </header>

      <section className="estadisticas">
        <div className="kpi"><strong>{datos.length}</strong><span>Total</span></div>
        <div className="kpi"><strong>{pendientes}</strong><span>Pendientes</span></div>
        <div className="kpi"><strong>{proceso}</strong><span>En proceso</span></div>
        <div className="kpi"><strong>{resueltos}</strong><span>Resueltas</span></div>
        <div className="kpi"><strong>{altas}</strong><span>Prioridad alta</span></div>
      </section>

      {error && <p className="error">Error: {error}</p>}

      <div className="columnas">
        <section className="panel">
          <h2>{editando === null ? 'Nueva incidencia' : 'Editar incidencia'}</h2>
          <form onSubmit={guardar}>
            <label>Título<input required maxLength="120" name="titulo"
              value={form.titulo} onChange={cambiar} placeholder="PC no enciende" /></label>
            <label>Descripción<textarea required name="descripcion" rows="4"
              value={form.descripcion} onChange={cambiar}
              placeholder="Describe el problema..." /></label>
            <label>Categoría<select name="categoria" value={form.categoria} onChange={cambiar}>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="red">Red / Internet</option>
            </select></label>
            <label>Prioridad<select name="prioridad" value={form.prioridad} onChange={cambiar}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select></label>
            <label>Estado<select name="estado" value={form.estado} onChange={cambiar}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="resuelto">Resuelto</option>
            </select></label>
             
             <label>Aula<input name="aula" maxLength="40"
             value={form.aula} onChange={cambiar} placeholder="Aula 2" /></label>

            <button className="principal" type="submit">
              {editando === null ? 'Registrar' : 'Guardar cambios'}
            </button>
            {editando !== null && <button type="button" onClick={cancelar}>
              Cancelar edición</button>}
          </form>
        </section>

        <section className="panel">
          <div className="cabecera-lista"><h2>Incidencias</h2>
            <span>{filtrados.length} mostradas</span>
            <button onClick={exportarCSV}>Exportar CSV</button></div>
          <div className="filtros">
            <input placeholder="Buscar por título o descripción..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="resuelto">Resuelto</option>
            </select>
            <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
              <option value="todas">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <select value={orden} onChange={e => setOrden(e.target.value)}>
              <option value="recientes">Más recientes primero</option>
              <option value="antiguas">Más antiguas primero</option>
            </select>
          </div>
          <div className="lista">
            {filtrados.length === 0 && <p className="sin-datos">No hay incidencias.</p>}
            {filtrados.map(item => (
              <article className="incidencia" key={item.id}>
                <div className="item-top"><h3>{item.titulo}</h3>
                  <span className={`prioridad ${item.prioridad}`}>{item.prioridad}</span></div>
                <p>{item.descripcion}</p>
                <div className="item-meta"><span>{item.categoria}</span>
                  <span>ID #{item.id}</span>
                 {item.aula && <span>Aula: {item.aula}</span>}</div>
                <div className="item-acciones">
                  <select aria-label="Cambiar estado" value={item.estado}
                    onChange={e => actualizarEstado(item.id, e.target.value)}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                  <button onClick={() => editar(item)}>Editar</button>
                  <button className="peligro" onClick={() => eliminar(item.id)}>Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <footer>Actividad académica · Uso local · Sin autenticación</footer>
    </main>
  )
}
