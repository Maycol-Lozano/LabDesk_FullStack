from rest_framework import serializers

from .models import Comentario, Incidencia


class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = ['id', 'incidencia', 'autor', 'texto', 'creado_en']
        read_only_fields = ['id', 'incidencia', 'creado_en']

    def validate_texto(self, valor):
        valor = valor.strip()
        if not valor:
            raise serializers.ValidationError('El comentario no puede estar vacío.')
        return valor


class IncidenciaSerializer(serializers.ModelSerializer):
    alerta = serializers.CharField(read_only=True)
    total_comentarios = serializers.SerializerMethodField()

    class Meta:
        model = Incidencia
        fields = [
            'id', 'titulo', 'descripcion', 'categoria', 'prioridad', 'estado',
            'aula', 'responsable', 'ubicacion', 'fecha_limite', 'creado_en',
            'alerta', 'total_comentarios',
        ]
        read_only_fields = ['id', 'creado_en', 'alerta', 'total_comentarios']

    def get_total_comentarios(self, obj):
        return obj.comentarios.count()

    def validate_titulo(self, valor):
        valor = valor.strip()
        if not valor:
            raise serializers.ValidationError('El título es obligatorio.')
        return valor

    def validate_descripcion(self, valor):
        valor = valor.strip()
        if not valor:
            raise serializers.ValidationError('La descripción es obligatoria.')
        return valor