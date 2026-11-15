export const ESTADOS = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
}
export const CATEGORIAS = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red / Internet',
}
export const PRIORIDADES = { baja: 'Baja', media: 'Media', alta: 'Alta' }

const dos = (n) => String(n).padStart(2, '0')

// "2026-11-15T18:00:00-05:00" -> "15/11/2026 18:00" (hora local del navegador)
export function formatoFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`
}

// ISO del servidor -> valor para <input type="datetime-local">
export function aInputLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`
}

// Escapa una celda para CSV.
export const celdaCSV = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

export function generarCSV(filas) {
  const columnas = [
    'id', 'titulo', 'descripcion', 'categoria', 'prioridad', 'estado',
    'responsable', 'ubicacion', 'aula', 'fecha_limite', 'alerta', 'creado_en',
  ]
  const lineas = filas.map((f) => columnas.map((c) => celdaCSV(f[c])).join(','))
  return '﻿' + [columnas.join(','), ...lineas].join('\n')
}
