from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth import authenticate
from rest_framework.response import Response
from .models import Doctor
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import DoctorSerializer
from django.http import JsonResponse
from django.views import View
from django.urls import reverse
from django.conf import settings
from .models import Consulta
from .serializers import ConsultaSerializer
from .serializers import UserRegistrationSerializer
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError


# API para crear un nuevo médico
@api_view(['POST'])
def create_doctor(request):
    serializer = DoctorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# API para listar todos los médicos (simplificada y utilizando una función normal)
@api_view(['GET'])
def doctor_list(request):
    doctors = Doctor.objects.all().values('id', 'first_name', 'last_name', 'specialty', 'profile_picture')
    return JsonResponse(list(doctors), safe=False)

# Vista genérica para crear un nuevo médico
class DoctorCreateView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

# Vista para listar todos los médicos usando Class-Based Views (opcional)
class DoctorListView(View):
    def get(self, request):
        doctors = Doctor.objects.all().values('id','first_name', 'last_name', 'specialty', 'profile_picture')
        for doctor in doctors:
            if doctor['profile_picture']:
                doctor['profile_picture'] = request.build_absolute_uri(settings.MEDIA_URL + doctor['profile_picture'])
        return JsonResponse(list(doctors), safe=False)
# Vista para ver detalles de un médico
class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class ConsultaCreateView(generics.CreateAPIView):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer

    def perform_create(self, serializer):
        medico_id = self.request.data.get('medico')
        fecha = self.request.data.get('fecha')
        hora = self.request.data.get('hora')

        # Verificar si ya existe una consulta con la misma fecha y hora para el médico
        consulta_existente = Consulta.objects.filter(medico_id=medico_id, fecha=fecha, hora=hora).exists()

        if consulta_existente:
            raise ValidationError("Ya existe una consulta reservada para este médico en la fecha y hora seleccionadas.")

        # Si no existe duplicado, guarda la nueva consulta
        serializer.save()

class ConsultaListView(generics.ListAPIView):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer

# API para registro de usuarios
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username  # Asegúrate de enviar el nombre de usuario también
        })
    return Response({'error': 'Invalid Credentials'}, status=400)

@api_view(['GET'])
def consultas_doctor(request, doctor_id):
    consultas = Consulta.objects.filter(medico_id=doctor_id)
    serializer = ConsultaSerializer(consultas, many=True)
    return Response(serializer.data)

