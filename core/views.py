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
from django.contrib.auth.models import User
from django.core.mail import send_mail


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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
        paciente_id = self.request.data.get('paciente')  # Obtener el paciente_id del request
        fecha = self.request.data.get('fecha')
        hora = self.request.data.get('hora')

        # Verificar si ya existe una consulta con la misma fecha y hora para el médico
        consulta_existente = Consulta.objects.filter(medico_id=medico_id, fecha=fecha, hora=hora).exists()

        if consulta_existente:
            raise ValidationError("Ya existe una consulta reservada para este médico en la fecha y hora seleccionadas.")

        # Obtener el paciente y el médico
        paciente = User.objects.get(id=paciente_id)  # Obtener el paciente de la tabla User
        medico = Doctor.objects.get(id=medico_id)  # Obtener el médico de la tabla Doctor

        # Guardar la consulta con el médico y paciente asociados
        consulta = serializer.save(paciente=paciente, medico=medico)

        # Obtener los emails del médico y del paciente directamente de los objetos
        email_medico = medico.email  # Correo del médico desde la tabla Doctor
        email_paciente = paciente.email  # Correo del paciente desde la tabla User

        # Asunto y cuerpo del correo
        subject = 'Recordatorio de Consulta Médica'
        message_paciente = f'Estimado(a) {paciente.first_name} {paciente.last_name},\n\n' \
                           f'Tiene una consulta programada con el Dr(a). {medico.first_name} {medico.last_name} ' \
                           f'el {consulta.fecha} a las {consulta.hora}.\n\n' \
                           'Gracias por usar nuestro servicio.'

        message_medico = f'Estimado(a) Dr(a). {medico.first_name} {medico.last_name},\n\n' \
                         f'Tiene una consulta programada con {paciente.first_name} {paciente.last_name} ' \
                         f'el {consulta.fecha} a las {consulta.hora}.\n\n' \
                         'Gracias por usar nuestro servicio.'

        # Enviar correo al paciente
        send_mail(
            subject,
            message_paciente,
            settings.EMAIL_HOST_USER,
            [email_paciente],
            fail_silently=False,
        )

        # Enviar correo al médico
        send_mail(
            subject,
            message_medico,
            settings.EMAIL_HOST_USER,
            [email_medico],
            fail_silently=False,
        )

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
            'username': user.username,
            'id': user.id,  # Devolver el ID del usuario para el frontend
            'is_superuser': user.is_superuser,  # Devolver si es superuser
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        })
    return Response({'error': 'No se encontro el usuario o la contraseña es incorrecta'}, status=400)



@api_view(['GET'])
def consultas_doctor(request, doctor_id):
    consultas = Consulta.objects.filter(medico_id=doctor_id)
    serializer = ConsultaSerializer(consultas, many=True)
    return Response(serializer.data)


@csrf_exempt
def send_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            subject = data.get('subject')
            message = data.get('message')
            recipient_list = data.get('recipient_list')

            send_mail(
                subject,
                message,
                'servesa07@gmail.com',  # Cambia esto por tu dirección de correo
                recipient_list,
                fail_silently=False,
            )

            return JsonResponse({'status': 'Email sent successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def consultas_paciente(request, paciente_id):
    consultas = Consulta.objects.filter(paciente_id=paciente_id).select_related('medico')
    
    # Agregar los datos del médico a la respuesta
    data = []
    for consulta in consultas:
        data.append({
            'id': consulta.id,
            'fecha': consulta.fecha,
            'hora': consulta.hora,
            'estado': consulta.estado,
            'medico_name': f'{consulta.medico.first_name} {consulta.medico.last_name}'  # Nombre completo del médico
        })
    
    return Response(data)

@api_view(['POST'])
def cancelar_consulta(request, consulta_id):
    consulta = Consulta.objects.get(id=consulta_id)
    consulta.delete()
    return Response({'message': 'Consulta cancelada correctamente.'})