from django.contrib import admin

from .models import Comentario, Incidencia


class ComentarioInline(admin.TabularInline):
    model = Comentario
    extra = 0


@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'estado', 'prioridad', 'responsable', 'fecha_limite')
    list_filter = ('estado', 'prioridad', 'categoria')
    search_fields = ('titulo', 'descripcion', 'responsable')
    inlines = [ComentarioInline]


@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ('incidencia', 'autor', 'creado_en')