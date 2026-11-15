from datetime import timedelta

from django.db import models
from django.utils import timezone


class Incidencia(models.Model):
    CATEGORIAS = [
        ('hardware', 'Hardware'),
        ('software', 'Software'),
        ('red', 'Red / Internet'),
    ]
    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En proceso'),
        ('resuelto', 'Resuelto'),
    ]

    titulo = models.CharField(max_length=120)
    descripcion = models.TextField()
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default='hardware')
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    aula = models.CharField(max_length=40, blank=True, default='')

    # --- LabDesk 2.0: seguimiento ---
    responsable = models.CharField(max_length=80, blank=True, default='')
    ubicacion = models.CharField(max_length=100, blank=True, default='')
    fecha_limite = models.DateTimeField(null=True, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

    @property
    def alerta(self):
        """
        'vencida' -> fecha_limite ya pasó y NO está resuelta.
        'proxima' -> vence en las próximas 24 horas y NO está resuelta.
        None      -> sin fecha, resuelta o con plazo holgado.
        """
        if self.estado == 'resuelto' or self.fecha_limite is None:
            return None
        ahora = timezone.now()
        if self.fecha_limite < ahora:
            return 'vencida'
        if self.fecha_limite <= ahora + timedelta(hours=24):
            return 'proxima'
        return None


class Comentario(models.Model):
    incidencia = models.ForeignKey(
        Incidencia, on_delete=models.CASCADE, related_name='comentarios'
    )
    autor = models.CharField(max_length=80, blank=True, default='')
    texto = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']

    def __str__(self):
        return f'Comentario #{self.pk} de la incidencia {self.incidencia_id}'