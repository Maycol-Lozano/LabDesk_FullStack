from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Incidencia
from .serializers import ComentarioSerializer, IncidenciaSerializer


class IncidenciaViewSet(viewsets.ModelViewSet):
    queryset = Incidencia.objects.all().order_by('-creado_en')
    serializer_class = IncidenciaSerializer

    # GET /api/incidencias/estadisticas/
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        ahora = timezone.now()
        todas = Incidencia.objects.all()
        total = todas.count()
        resueltas = todas.filter(estado='resuelto').count()
        no_resueltas = todas.exclude(estado='resuelto')

        vencidas = no_resueltas.filter(fecha_limite__lt=ahora).count()
        proximas = no_resueltas.filter(
            fecha_limite__gte=ahora,
            fecha_limite__lte=ahora + timedelta(hours=24),
        ).count()
        porcentaje = round(resueltas / total * 100, 1) if total else 0

        return Response({
            'total': total,
            'por_estado': {
                'pendiente': todas.filter(estado='pendiente').count(),
                'en_proceso': todas.filter(estado='en_proceso').count(),
                'resuelto': resueltas,
            },
            'por_prioridad': {
                'baja': todas.filter(prioridad='baja').count(),
                'media': todas.filter(prioridad='media').count(),
                'alta': todas.filter(prioridad='alta').count(),
            },
            'vencidas': vencidas,
            'proximas_a_vencer': proximas,
            'porcentaje_resolucion': porcentaje,
        })

    # GET / POST /api/incidencias/<id>/comentarios/
    @action(detail=True, methods=['get', 'post'])
    def comentarios(self, request, pk=None):
        incidencia = get_object_or_404(Incidencia, pk=pk)

        if request.method == 'GET':
            serializer = ComentarioSerializer(incidencia.comentarios.all(), many=True)
            return Response(serializer.data)

        serializer = ComentarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(incidencia=incidencia)
        return Response(serializer.data, status=status.HTTP_201_CREATED)