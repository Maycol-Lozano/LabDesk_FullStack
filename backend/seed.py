from datetime import timedelta
from django.utils import timezone
from incidencias.models import Comentario, Incidencia

ahora = timezone.now()
datos = [
    ("PC no enciende", "hardware", "alta", "pendiente", "Carlos Ruiz", "Lab 1, puesto 3", ahora - timedelta(days=2)),
    ("Python no abre", "software", "media", "en_proceso", "Ana Torres", "Lab 2, puesto 5", ahora + timedelta(hours=5)),
    ("Wi-Fi lento", "red", "alta", "pendiente", "Carlos Ruiz", "Pasillo principal", ahora + timedelta(days=3)),
    ("Teclado defectuoso", "hardware", "baja", "resuelto", "Ana Torres", "Lab 1, puesto 7", ahora - timedelta(days=1)),
    ("Navegador desactualizado", "software", "media", "resuelto", "Luis Pérez", "Lab 2, puesto 1", None),
    ("Proyector sin imagen", "hardware", "alta", "en_proceso", "Luis Pérez", "Aula 2", ahora - timedelta(hours=3)),
]
for t, c, p, e, r, u, f in datos:
    i = Incidencia.objects.create(
        titulo=t, descripcion=f"{t}: falla reportada en el laboratorio.",
        categoria=c, prioridad=p, estado=e, responsable=r, ubicacion=u, fecha_limite=f)
    if e != "pendiente":
        Comentario.objects.create(incidencia=i, autor=r, texto="Revisando el equipo.")
        Comentario.objects.create(incidencia=i, autor=r, texto="Se identificó la causa y se está corrigiendo.")
print("Listo:", Incidencia.objects.count(), "incidencias,", Comentario.objects.count(), "comentarios")