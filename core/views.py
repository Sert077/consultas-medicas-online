import tempfile
import uuid
from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth import authenticate
from rest_framework.response import Response
from .models import Doctor
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import DoctorSerializer
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.urls import reverse
from django.conf import settings
from .models import Consulta
from .serializers import ConsultaSerializer, RecetaSerializer
from .serializers import UserRegistrationSerializer
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.core.mail import send_mail
from .models import ChatMessage, Perfil
from django.views.decorators.csrf import csrf_exempt
import json
from .models import EmailVerificationToken, Receta
from rest_framework.views import APIView
from rest_framework import status
from .serializers import UserSerializer, PerfilSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from io import BytesIO
import os
import qrcode
import tempfile
from django.core.files.base import ContentFile
from PIL import Image
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Image
from reportlab.platypus import HRFlowable
from django.core.mail import EmailMessage
from django.core.paginator import Paginator
from django.db.models import Count, Avg
from datetime import datetime
from fpdf import FPDF
import matplotlib.pyplot as plt
import io
import base64
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.dateparse import parse_date
import random
from django.utils.timezone import now
from django.core.mail import EmailMultiAlternatives 
from email.mime.image import MIMEImage

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
        # Generar o recuperar el token del usuario
        token, created = Token.objects.get_or_create(user=user)

        if user.is_superuser:
            # Si es superuser, no necesitamos 'tipo_usuario'
            return Response({
                'token': token.key,
                'username': user.username,
                'id': user.id,
                'is_superuser': user.is_superuser,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
            })

        # Para usuarios normales, intentar obtener el perfil
        try:
            perfil = user.perfil  # Ajusta esto si el atributo tiene otro nombre
            tipo_usuario = perfil.tipo_usuario
            birthdate = perfil.birthdate

            # Verificar si es paciente y si está verificado
            if tipo_usuario == 'paciente' and not perfil.verificado:
                return Response(
                    {'error': 'Por favor, verifica tu correo antes de iniciar sesión.'},
                    status=403  # Forbidden
                )
        except AttributeError:
            # En caso de que no tenga perfil
            return Response({'error': 'El usuario no tiene un perfil asociado.'}, status=400)

        return Response({
            'token': token.key,
            'username': user.username,
            'id': user.id,
            'is_superuser': user.is_superuser,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'tipo_usuario': tipo_usuario,
            'birthdate': birthdate,
        })

    return Response({'error': 'No se encontró el usuario o la contraseña es incorrecta'}, status=400)


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
            html_message = data.get('html_message')

            email = EmailMultiAlternatives(
                subject,
                message,  # Versión en texto plano
                'servesa07@gmail.com',
                recipient_list,
            )

            if html_message:
                email.attach_alternative(html_message, "text/html")

                # Ruta de la imagen del logo
                logo_path = os.path.join(settings.MEDIA_ROOT, "profile_pictures/logos/logo1.png")

                if os.path.exists(logo_path):
                    with open(logo_path, 'rb') as logo_file:
                        logo = MIMEImage(logo_file.read(), _subtype="png")
                        logo.add_header('Content-ID', '<logo1>')  # Content-ID para el HTML
                        logo.add_header('Content-Disposition', 'inline', filename="logo1.png")
                        email.attach(logo)

            email.send(fail_silently=False)
            return JsonResponse({'status': 'Email sent successfully'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@api_view(['GET'])
def consultas_paciente(request, paciente_id):
    consultas = Consulta.objects.filter(paciente_id=paciente_id).select_related('medico').prefetch_related('recetas')
    

    data = []
    for consulta in consultas:
        receta = consulta.recetas.first()  # Suponemos una receta por consulta
        data.append({
            'id': consulta.id,
            'fecha': consulta.fecha,
            'hora': consulta.hora,
            'estado': consulta.estado,
            'medico_name': f'{consulta.medico.first_name} {consulta.medico.last_name}',
            'doc_receta': receta.doc_receta.url if receta and receta.doc_receta else None,  # URL del documento
            
            "tipo_consulta": consulta.tipo_consulta,
        })
    
    return Response(data)


@api_view(['POST'])
def cancelar_consulta(request, consulta_id):
    consulta = Consulta.objects.get(id=consulta_id)
    consulta.delete()
    return Response({'message': 'Consulta cancelada correctamente.'})


def consultas_medico(request, user_id):
    try:
        # Verificar si el usuario es un médico
        doctor = Doctor.objects.get(user_id=user_id)  # Buscar el doctor por su user_id
        consultas = Consulta.objects.filter(medico_id=doctor.id)  # Filtrar las consultas por el medico_id

        # Preparar los datos para la respuesta
        consultas_data = []
        for consulta in consultas:
            # Buscar la receta asociada a la consulta
            receta = Receta.objects.filter(consulta=consulta.id).first()
            doc_receta_url = f"{settings.MEDIA_URL}{receta.doc_receta}" if receta and receta.doc_receta else None
            archivo_pdf_url = f"{settings.MEDIA_URL}{consulta.archivo_pdf}" if consulta.archivo_pdf else None

             # Buscar el perfil del paciente y obtener su foto
            paciente_perfil = Perfil.objects.filter(user=consulta.paciente).first()
            paciente_foto_url = f"{settings.MEDIA_URL}{paciente_perfil.user_picture}" if paciente_perfil and paciente_perfil.user_picture else None

            # Crear el diccionario de datos
            consultas_data.append({
                "id": consulta.id,
                "paciente_name": f"{consulta.paciente.last_name} {consulta.paciente.first_name}",
                "paciente_foto": paciente_foto_url,
                "fecha": consulta.fecha,
                "hora": consulta.hora,
                "estado": consulta.estado,  # Incluir el estado de la consulta
                "doc_receta": doc_receta_url,  # Incluir la URL de la receta si existe
                "archivo_pdf": archivo_pdf_url,
                "tipo_consulta": consulta.tipo_consulta,
                "embarazo": consulta.embarazo,
                "tipo_sangre": consulta.tipo_sangre,
                "alergias": consulta.alergias,
                "edad": consulta.edad,
                "genero": consulta.genero,
                "motivo_consulta": consulta.motivo_consulta,
            })

        return JsonResponse(consultas_data, safe=False)

    except Doctor.DoesNotExist:
        return JsonResponse({"error": "Este usuario no es un médico"}, status=404)
    

def get_chat_messages(request, chat_id):
    messages = ChatMessage.objects.filter(chat_id=chat_id).order_by('timestamp')
    message_list = []
    for message in messages:
        message_data = {
            'id': message.id,
            'sender_id': message.sender_id,
            'sender_name': message.sender_name,
            'message': message.message,
            'image': message.image.url if message.image else None,
            'pdf': message.pdf.url if message.pdf else None,
            'type': 'image' if message.image else 'pdf' if message.pdf else 'text',
            'timestamp': message.timestamp.isoformat(),
        }
        message_list.append(message_data)
    return JsonResponse(message_list, safe=False)

@csrf_exempt
def upload_image(request, chat_id):
    if request.method == 'POST':
        sender_id = request.POST.get('sender_id')
        sender_name = request.POST.get('sender_name')
        image = request.FILES.get('image')

        chat_message = ChatMessage.objects.create(
            chat_id=chat_id,
            sender_id=sender_id,
            sender_name=sender_name,
            image=image
        )

        message_data = {
            'message': None,
            'sender_id': chat_message.sender_id,
            'sender_name': chat_message.sender_name,
            'image': chat_message.image.url,
        }
        return JsonResponse(message_data)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@api_view(['GET'])
def get_doctor_by_chat(request, chat_id):
    try:
        consulta = Consulta.objects.get(id=chat_id)  # Obtener la consulta usando el ID del chat
        doctor = Doctor.objects.get(id=consulta.medico_id)  # Obtener el médico asociado
        doctor_data = {
            'first_name': doctor.first_name,
            'last_name': doctor.last_name
        }
        return JsonResponse(doctor_data)
    except Consulta.DoesNotExist:
        return JsonResponse({'error': 'Consulta no encontrada'}, status=404)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Médico no encontrado'}, status=404)
    
@api_view(['GET'])
def consulta_detail(request, chat_id):
    try:
        consulta = Consulta.objects.get(id=chat_id)
        return Response({
            'paciente_id': consulta.paciente.id
        })
    except Consulta.DoesNotExist:
        return Response({'error': 'Consulta no encontrada'}, status=404)

@api_view(['GET'])
def user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        return Response({
            'first_name': user.first_name,
            'last_name': user.last_name
        })
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)

class VerifyEmailView(APIView):
    def get(self, request, token):
        try:
            verification_token = EmailVerificationToken.objects.get(token=token)
            user = verification_token.user
            user.perfil.verificado = True
            user.perfil.save()
            verification_token.delete()  # Eliminar el token después de la verificación
            return Response({"message": "Correo verificado exitosamente."}, status=status.HTTP_200_OK)
        except EmailVerificationToken.DoesNotExist:
            return Response({"error": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def patient_profile(request):
    if request.method == 'GET':
        # Serializar al usuario con los datos de perfil
        user_serializer = UserSerializer(request.user)
        return Response(user_serializer.data)

    elif request.method == 'PUT':
        # Serializar al usuario para actualizar datos del perfil
        user_serializer = UserSerializer(request.user, data=request.data, partial=True)
        perfil_serializer = PerfilSerializer(request.user.perfil, data=request.data, partial=True)  # Actualizamos el perfil

        if user_serializer.is_valid() and perfil_serializer.is_valid():
            user_serializer.save()
            perfil_serializer.save()  # Guardamos los cambios en el perfil
            return Response({"message": "Datos actualizados con éxito"})
        
        # Si no es válido, respondemos con el error
        return Response(user_serializer.errors, status=400)
    

class GenerarRecetaView(APIView):
    def post(self, request):
        data = request.data
        try:
            # Obtener la consulta relacionada
            consulta = Consulta.objects.get(id=data['id_consulta'])

            # Verificar si ya existe una receta con el mismo diagnóstico y consulta
            if Receta.objects.filter(consulta=consulta, diagnostico=data['diagnostico']).exists():
                return Response({"error": "Ya existe una receta con este diagnóstico para esta consulta"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Crear la receta
            receta = Receta.objects.create(
                consulta=consulta,
                paciente=consulta.paciente,
                medico=consulta.medico,
                nombre_paciente=data['nombre_paciente'],
                id_card=consulta.paciente.perfil.id_card,
                genero=consulta.genero,
                tipo_sangre=consulta.tipo_sangre,
                alergias=consulta.alergias,
                edad=consulta.edad,
                peso=data['peso'],
                talla=data['talla'],
                diagnostico=data['diagnostico'],
                tratamiento=data['tratamiento'],
                indicaciones=data.get('indicaciones', ''),
                notas=data.get('notas', '')
            )

            # Actualizar el estado de la consulta a "realizada"
            consulta.estado = "realizada"
            consulta.save()

            # Generar PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []

            # Estilos
            normal_style = ParagraphStyle(name='Normal', fontSize=10, leading=12)
            medico_style = ParagraphStyle(name='Normal', fontSize=14, leading=16)
            header_style = ParagraphStyle(name='Header', fontSize=14, leading=16, spaceAfter=12)
            bold_style = ParagraphStyle(name='Bold', fontSize=12, leading=14, spaceAfter=12, fontName="Helvetica-Bold")
            bold_style_small = ParagraphStyle(name='Bold', fontSize=8, leading=10, spaceAfter=5, fontName="Helvetica-Bold")
            small_style = ParagraphStyle(name='Small', fontSize=8, leading=10)
            right_align_style = ParagraphStyle(name='RightAlign', fontSize=10, alignment=2)  # Alineación a la derecha

            # Fecha (alineada a la derecha)
            elements.append(Paragraph(receta.fecha_creacion.strftime("%B %d, %Y"), right_align_style))

            # Información del médico (con imagen a la izquierda)
            medico = receta.medico
            medico_image_path = medico.profile_picture.path if medico.profile_picture else None

            # Si el médico tiene una foto de perfil, agregamos la imagen
            medico_image = None
            if medico_image_path and os.path.exists(medico_image_path):
                medico_image = Image(medico_image_path, width=100, height=100)

            # Crear la tabla para colocar la imagen y los datos del médico
            medico_data = f"""
                Dr(a): {medico.first_name} {medico.last_name}<br/>
                Especialidad: {medico.specialty}<br/>
                Dirección: {medico.address or 'N/A'}<br/>
                Teléfono: {medico.phone_number}<br/>
                Correo electrónico: {medico.email}
            """
            # Modificar estilo de negrita solo en los datos específicos
            medico_data = medico_data.replace("Dr(a):", "<b>Dr(a):</b>").replace("Especialidad:", "<b>Especialidad:</b>").replace("Dirección:", "<b>Dirección:</b>").replace("Teléfono:", "<b>Teléfono:</b>").replace("Correo electrónico:", "<b>Correo electrónico:</b>")

            medico_table = [[medico_image, Paragraph(medico_data, medico_style)]]
            table = Table(medico_table, colWidths=[100, 400])  # Ajusta el ancho de las columnas
            table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'CENTER'),  # Centrado de la imagen
                ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),  # Centrado vertical de la imagen
                ('ALIGN', (1, 0), (1, 0), 'LEFT'),  # Alineación izquierda del texto
                ('TEXTCOLOR', (0, 0), (-1, -1), (0, 0, 0)),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 35),  # Añadir padding a la izquierda
            ]))
            elements.append(table)
            elements.append(Spacer(1, 12))

            # Agregar una línea horizontal después de la sección de información del médico
            elements.append(HRFlowable())
            elements.append(Paragraph("<b>PACIENTE</b>", header_style))
            # Información del paciente (solo las palabras específicas en negrita)
            paciente_data = f"""
                Nombre: {receta.nombre_paciente}<br/>
                CI: {receta.id_card}<br/>
                Edad: {receta.edad}<br/>
                Género: {receta.genero}<br/>
                <b></b>
                Alergias: {receta.alergias or 'Ninguna'}<br/>
                Grupo Sanguineo: {receta.tipo_sangre} Peso: {receta.peso} kg, Talla: {receta.talla} cm
            """
            # Modificar estilo de negrita solo en los datos específicos
            paciente_data = paciente_data.replace("Nombre:", "<b>Nombre:</b>").replace("CI:", "<b>CI:</b>").replace("Edad:", "<b>Edad:</b>").replace("Género:", "<b>Género:</b>").replace("Alergias:", "<b>Alergias:</b>").replace("Grupo Sanguineo:", "<b>Grupo Sanguineo:</b>").replace("Peso:", "<b>Peso:</b>").replace("Talla:", "<b>Talla:</b>")

            elements.append(Paragraph(paciente_data, normal_style))
            elements.append(Spacer(1, 12))

            # Agregar una línea horizontal después de la sección de información del paciente
            elements.append(HRFlowable())

            # Diagnóstico
            elements.append(Paragraph("<b>DIAGNÓSTICO</b>", header_style))
            elements.append(Paragraph(receta.diagnostico, normal_style))
            elements.append(Spacer(1, 12))

            # Agregar una línea horizontal después del diagnóstico
            elements.append(HRFlowable())

            # Tratamiento
            elements.append(Paragraph("<b>TRATAMIENTO</b>", header_style))
            elements.append(Paragraph(receta.tratamiento, normal_style))
            elements.append(Spacer(1, 12))

            # Otras indicaciones
            if receta.indicaciones:
                elements.append(Paragraph("<b>Otras indicaciones</b>", bold_style))
                elements.append(Paragraph(receta.indicaciones, normal_style))
                elements.append(Spacer(1, 12))

            # Firma
            firma_texto = f"Firmado digitalmente por Dr(a): {medico.first_name} {medico.last_name}"
            firma_paragraph = Paragraph(firma_texto, ParagraphStyle(name='Justify', fontSize=10, alignment=4))  # Justificado

            # Generar QR
            qr = qrcode.make(firma_texto)
            qr_buffer = BytesIO()
            qr.save(qr_buffer, format="PNG")
            qr_buffer.seek(0)

            # Convertir el buffer a un archivo temporal para reportlab
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_qr_file:
                tmp_qr_file.write(qr_buffer.getvalue())
                tmp_qr_path = tmp_qr_file.name

            # Agregar el QR y el texto justificado en una tabla
            qr_image = Image(tmp_qr_path, width=1 * inch, height=1 * inch)
            qr_table = Table([[firma_paragraph, qr_image]], colWidths=[400, 100])
            qr_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),  # Alineación izquierda para el texto
                ('ALIGN', (1, 0), (1, 0), 'CENTER'),  # Centrado del QR
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),  # Centrado vertical
                ('LEFTPADDING', (0, 0), (-1, -1), 21),  # Añadir padding
            ]))

            elements.append(qr_table)
            elements.append(Spacer(1, 12))  # Espacio después del QR
            # Notas
            if receta.notas:
                elements.append(Spacer(1, 24))
                elements.append(Paragraph("<b>Notas:</b>", bold_style_small))
                elements.append(Paragraph(receta.notas, small_style))

            # Construir PDF
            doc.build(elements)

            # Eliminar el archivo temporal después de generar el PDF
            os.unlink(tmp_qr_path)

            # Guardar el PDF en el modelo
            pdf_file = ContentFile(buffer.getvalue())
            filename = f"receta_{receta.id}.pdf"
            receta.doc_receta.save(filename, pdf_file)

        
             # Preparar el correo electrónico
            paciente_email = consulta.paciente.email
            asunto = f"Consulta Nº {consulta.id} 📋 Receta Médica de MEDITEST"
            mensaje = f"""
                            Estimado {consulta.paciente.first_name},

                            Esperamos que este mensaje le encuentre bien.

                            Nos complace informarle que su receta médica está lista. Puede encontrar su receta adjunta a este correo electrónico en formato PDF. A continuación, encontrará los detalles de su consulta:

                            Detalles de la Consulta:
                            Paciente: {consulta.paciente.first_name} {consulta.paciente.last_name}
                            Consulta Nº: {consulta.id}
                            Médico: {consulta.medico.first_name} {consulta.medico.last_name}

                            Adjunto:
                            Receta Médica: {receta.doc_receta.url}

                            Instrucciones Importantes:
                            - Revise detenidamente su receta para asegurarse de que toda la información es correcta.
                            - Siga las indicaciones del tratamiento y las dosis recomendadas por su médico.
                            - Si tiene alguna pregunta o necesita aclaraciones, no dude en contactarnos.

                            Contacto:
                            Correo Electrónico: servesa07@gmail.com
                            Teléfono: +591 68449128

                            Agradecemos su confianza en MediTest. Trabajamos constantemente para brindar el mejor servicio de salud para usted y su familia.

                            Saludos cordiales,
                            El Equipo de MediTest.
                                        """

            # Enviar el correo con el PDF adjunto
            email = EmailMessage(
                subject=asunto,
                body=mensaje,
                from_email='servesa07@gmail.com',
                to=[paciente_email],
            )
            email.attach(f"receta_{receta.id}.pdf", buffer.getvalue(), "application/pdf")
            email.send(fail_silently=False)

            return Response({"message": "Receta generada y enviada al paciente exitosamente."}, status=status.HTTP_201_CREATED)

        except Consulta.DoesNotExist:
            return Response({"error": "Consulta no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# Vista para obtener todas las consultas y recetas con filtros
def historial_consultas(request):
    consultas = Consulta.objects.all()
    recetas = Receta.objects.all()

    # Filtros por fecha, consultas, recetas y búsqueda por palabra
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    
    if fecha_inicio and fecha_fin:
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
            consultas = consultas.filter(fecha__range=[fecha_inicio, fecha_fin])
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)

    if 'consulta_estado' in request.GET:
        consultas = consultas.filter(estado=request.GET['consulta_estado'])

    if 'busqueda' in request.GET:
        busqueda = request.GET['busqueda']
        consultas = consultas.filter(motivo_consulta__icontains=busqueda)

    # Paginación de resultados
    paginator = Paginator(consultas, 10)  # 10 consultas por página
    page = request.GET.get('page')
    consultas_paginadas = paginator.get_page(page)

    # Usamos list() para convertir el queryset a una lista de diccionarios
    consultas_data = list(consultas_paginadas.object_list.values(
        'id', 'fecha', 'hora', 'estado', 'motivo_consulta', 'genero', 'tipo_sangre', 'edad', 'tipo_consulta', 'embarazo', 'medico__first_name', 'medico__last_name'
    ))
    recetas_data = list(recetas.values(
        'id', 'nombre_paciente', 'diagnostico', 'fecha_creacion', 'medico__first_name', 'medico__last_name'
    ))

    data = {
        'consultas': consultas_data,
        'recetas': recetas_data,
        'total_consultas': consultas.count(),
        'total_recetas': recetas.count()
    }

    return JsonResponse(data)


def generar_reporte(request):
    especialidades = [
        'Alergología', 'Cardiología', 'Dermatología', 'Endocrinología', 'Fisioterapia',
        'Gastroenterología', 'Geriatría', 'Ginecología', 'Hematología', 'Infectología',
        'Medicina General', 'Medicina Interna', 'Neumología', 'Neurología', 'Nefrología',
        'Nutrición', 'Oftalmología', 'Oncología', 'Otorrinolaringología', 'Pediatría', 
        'Podiatría', 'Psicología', 'Psiquiatría', 'Reumatología', 'Salud Mental Infantil',
        'Sexología', 'Traumatología', 'Urología', 'Otros'
    ]

    reporte_tipo = request.GET.get('tipo', '')
    fecha_inicio = request.GET.get('fecha_inicio')
    fecha_fin = request.GET.get('fecha_fin')
    grafico_tipo = request.GET.get('grafico_tipo', 'barras_verticales')

    # Filtrado base
    consultas = Consulta.objects.all()

    if fecha_inicio:
        consultas = consultas.filter(fecha__gte=fecha_inicio)
    if fecha_fin:
        consultas = consultas.filter(fecha__lte=fecha_fin)

    total_consultas = consultas.count()
    promedio_edad = consultas.aggregate(promedio_edad=Avg('edad'))['promedio_edad']
    promedio_edad = round(promedio_edad, 2) if promedio_edad else "No disponible"

    fecha_generacion = now().strftime("%Y-%m-%d %H:%M:%S")

    if reporte_tipo == 'estado':
        consultas_por_estado = consultas.values('estado').annotate(count=Count('estado'))
        chart_data = consultas_por_estado
        title = 'Consultas por estado'
        xlabel = 'Estado'
        ylabel = 'Cantidad'
    elif reporte_tipo == 'genero':
        consultas_por_genero = consultas.values('genero').annotate(count=Count('genero'))
        chart_data = consultas_por_genero
        title = 'Consultas por género'
        xlabel = 'Género'
        ylabel = 'Cantidad'
    elif reporte_tipo == 'especialidad':
        consultas_por_especialidad = consultas.filter(medico__specialty__in=especialidades) \
            .values('medico__specialty').annotate(count=Count('medico__specialty'))
        chart_data = consultas_por_especialidad
        title = 'Consultas por especialidad'
        xlabel = 'Especialidad'
        ylabel = 'Cantidad'
    elif reporte_tipo == 'edad':
        consultas_por_edad = consultas.values('edad').annotate(count=Count('edad'))
        chart_data = consultas_por_edad
        title = 'Consultas por edad'
        xlabel = 'Edad'
        ylabel = 'Cantidad'
    elif reporte_tipo == 'tipo_sangre':
        consultas_por_tipo_sangre = consultas.values('tipo_sangre').annotate(count=Count('tipo_sangre'))
        chart_data = consultas_por_tipo_sangre
        title = 'Consultas por tipo de sangre'
        xlabel = 'Tipo de sangre'
        ylabel = 'Cantidad'
    elif reporte_tipo == 'tipo_consulta':
        consultas_por_tipo_consulta = consultas.values('tipo_consulta').annotate(count=Count('tipo_consulta'))
        chart_data = consultas_por_tipo_consulta
        title = 'Consultas por tipo de consulta'
        xlabel = 'Tipo de consulta'
        ylabel = 'Cantidad'
    else:
        chart_data = []
        title = 'Reporte no disponible'
        xlabel = ''
        ylabel = ''

    def create_chart(data, title, xlabel, ylabel, chart_type='barras_verticales'):
        plt.clf()
        labels = [str(item.get(list(item.keys())[0], 'Desconocido')) for item in data]
        counts = [item.get('count', 0) for item in data]

        colores_aleatorios = ['#' + ''.join([random.choice('0123456789ABCDEF') for _ in range(6)]) for _ in labels]

        if chart_type == 'barras_horizontales':
            plt.barh(labels, counts, color=colores_aleatorios)
        elif chart_type == 'pastel':
            plt.pie(counts, labels=labels, autopct='%1.1f%%', startangle=140, colors=colores_aleatorios)
        else:
            plt.bar(labels, counts, color=colores_aleatorios)

        plt.title(title)
        plt.xlabel(xlabel if chart_type != 'pastel' else '')
        plt.ylabel(ylabel if chart_type != 'pastel' else '')

        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmpfile:
            plt.savefig(tmpfile, format='png')
            tmpfile.close()
            return tmpfile.name

    chart = create_chart(chart_data, title, xlabel, ylabel, grafico_tipo)

    pdf = FPDF()
    pdf.add_page()

    # Fecha de generación como encabezado (alineada a la derecha)
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 10, f'Fecha de Generación: {fecha_generacion}', ln=True, align='R')

    # Título del reporte
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(200, 10, 'Reporte de Consultas', ln=True, align='C')

    # Título del gráfico
    pdf.set_font('Arial', '', 12)
    pdf.ln(10)  # Espacio antes del título
    pdf.cell(200, 10, title, ln=True, align='C')
    
    # Incluir el gráfico
    if chart:
        pdf.image(chart, x=10, y=30, w=180)

    # Estadísticas adicionales
    consultas_por_estado = consultas.values('estado').annotate(count=Count('estado'))
    estado_consultas = {estado['estado']: estado['count'] for estado in consultas_por_estado}
    canceladas = estado_consultas.get('cancelada', 0)
    realizadas = estado_consultas.get('realizada', 0)
    pendientes = estado_consultas.get('pendiente', 0)

    # Promedio de Edad por Género
    promedio_edad_genero = consultas.values('genero').annotate(promedio_edad=Avg('edad'))
    promedio_edad_genero = {item['genero']: item['promedio_edad'] for item in promedio_edad_genero}

    # Agregar los datos al reporte PDF
    pdf.ln(120)  # Espacio adicional antes de la sección
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, 'Datos Adicionales:', ln=True)

    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 10, f'Total de Consultas: {total_consultas}', ln=True)
    pdf.cell(0, 10, f'Promedio de Edad de los Pacientes: {promedio_edad}', ln=True)

    # Rango de Fechas
    if fecha_inicio and fecha_fin:
        pdf.cell(0, 10, f'Rango de Fechas: {fecha_inicio} - {fecha_fin}', ln=True)
    else:
        pdf.cell(0, 10, 'Rango de Fechas: No disponible', ln=True)

    # Consultas por Estado
    pdf.cell(0, 10, f'Consultas Realizadas: {realizadas} ({(realizadas/total_consultas)*100:.2f}%)', ln=True)
    pdf.cell(0, 10, f'Consultas Pendientes: {pendientes} ({(pendientes/total_consultas)*100:.2f}%)', ln=True)
    pdf.cell(0, 10, f'Consultas Canceladas: {canceladas} ({(canceladas/total_consultas)*100:.2f}%)', ln=True)

    # Promedio de Edad por Género
    for genero, edad in promedio_edad_genero.items():
        pdf.cell(0, 10, f'Promedio de Edad de {genero}: {edad:.2f}', ln=True)

    pdf.ln(6.99)  # Espacio para el pie de página
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 10, 'Equipo de MediTest', ln=True, align='L')

    pdf_output = pdf.output(dest='S').encode('latin1')
    response = HttpResponse(pdf_output, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="reporte_consultas.pdf"'
    
    return response


@api_view(['GET'])
def get_authenticated_doctor(request):
    if request.user.is_authenticated and hasattr(request.user, 'doctor'):
        doctor = request.user.doctor
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)
    return Response({'detail': 'Usuario no autorizado'}, status=401)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_pdf(request, chat_id):
    if 'pdf' not in request.FILES:
        return JsonResponse({'error': 'No se envió ningún archivo PDF'}, status=400)

    pdf = request.FILES['pdf']
    sender_id = request.data.get('sender_id')
    sender_name = request.data.get('sender_name')

    chat_message = ChatMessage.objects.create(
        chat_id=chat_id,
        sender_id=sender_id,
        sender_name=sender_name,
        pdf=pdf
    )

    return JsonResponse({
        'message': None,
        'pdf': chat_message.pdf.url,
        'sender_id': sender_id,
        'sender_name': sender_name,
    })

@api_view(['GET'])
def get_pdfs(request, chat_id):
    pdf_messages = ChatMessage.objects.filter(chat_id=chat_id).order_by('id')

    pdf_list = [
        {
            'id': msg.id,
            'pdf': msg.pdf.url if msg.pdf else None,  # Verifica si hay archivo
            'sender_id': msg.sender_id,
            'sender_name': msg.sender_name,
            'type': 'pdf'
        }
        for msg in pdf_messages if msg.pdf  # Filtra los que tienen PDF
    ]

    return JsonResponse(pdf_list, safe=False)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cambiar_estado_consulta(request, consulta_id):
    try:
        consulta = Consulta.objects.get(id=consulta_id)
        
        if not hasattr(request.user, 'perfil') or request.user.perfil.tipo_usuario != 'medico':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        consulta.estado = 'realizada'
        consulta.save()
        
        return Response({'message': 'Consulta Realizada \nCorrectamente'}, status=status.HTTP_200_OK)
    except Consulta.DoesNotExist:
        return Response({'error': 'Consulta no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
@csrf_exempt
def cancelar_consultas(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            consulta_ids = data.get("consultas", [])

            consultas_canceladas = []
            correos_notificados = []

            for consulta_id in consulta_ids:
                consulta = Consulta.objects.get(id=consulta_id)
                consulta.estado = "cancelada"
                consulta.token_reprogramacion = uuid.uuid4()  # Generar un token único
                consulta.save()

                # Enviar email con el enlace único de reprogramación
                if consulta.paciente:
                    email_paciente = consulta.paciente.email
                    link_reprogramacion = f"http://localhost:3000/reprogramar/{consulta.token_reprogramacion}"

                    subject = "Consulta médica cancelada - Reprogramación"
                    message = f"Estimado/a {consulta.paciente.first_name},\n\n" \
                              f"Su consulta programada para el {consulta.fecha} a las {consulta.hora} ha sido cancelada.\n" \
                              f"Puede reprogramarla en el siguiente enlace:\n\n {link_reprogramacion}\n\n" \
                              f"Atentamente,\nEquipo de MediTest."

                    send_mail(subject, message, 'servesa07@gmail.com', [email_paciente])

                    correos_notificados.append(email_paciente)

                consultas_canceladas.append(consulta_id)

            return JsonResponse({"success": True, "canceladas": consultas_canceladas, "notificados": correos_notificados}, status=200)
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)
    else:
        return JsonResponse({"success": False, "error": "Método no permitido"}, status=405)
    
@csrf_exempt
def reprogramar_consulta(request, token):
    try:
        consulta = Consulta.objects.get(token_reprogramacion=token)

        if request.method == 'GET':
            return JsonResponse({
                "success": True,
                "doctor": {
                    "start_time": consulta.medico.start_time.strftime("%H:%M"),
                    "end_time": consulta.medico.end_time.strftime("%H:%M"),
                    "doctor_id": consulta.medico.id,
                    "fecha_consulta": consulta.fecha,
                    "days": consulta.medico.days,
                    "first_name": consulta.medico.first_name,
                    "last_name": consulta.medico.last_name,
                    "specialty": consulta.medico.specialty,
                    "email": consulta.medico.email,
                    "phone_number": consulta.medico.phone_number,
                    "address": consulta.medico.address,
                    "profile_picture": consulta.medico.profile_picture.url if consulta.medico.profile_picture else None,
                }
            })

        elif request.method == 'POST':
            data = json.loads(request.body)
            nueva_fecha = data.get("fecha")
            nueva_hora = data.get("hora")

            if not nueva_fecha or not nueva_hora:
                return JsonResponse({"success": False, "error": "Fecha y hora son obligatorias"}, status=400)

            consulta.fecha = nueva_fecha
            consulta.hora = nueva_hora
            consulta.estado = "reprogramada"
            consulta.token_reprogramacion = None  # Invalidar el token
            consulta.save()

            return JsonResponse({"success": True, "mensaje": "Consulta reprogramada exitosamente"}, status=200)

    except Consulta.DoesNotExist:
        return JsonResponse({"success": False, "error": "Token inválido o consulta no encontrada"}, status=404)

    return JsonResponse({"success": False, "error": "Método no permitido"}, status=405)


@csrf_exempt
def enviar_solicitud_medico(request):
    if request.method == 'POST':
        try:
            # Obtener los datos del formulario en JSON
            data = json.loads(request.body)
            nombre = data.get("nombre", "")
            especialidad = data.get("especialidad", "")
            email = data.get("email", "")
            telefono = data.get("telefono", "")
            mensaje = data.get("mensaje", "")

            # Verificar que los campos requeridos estén completos
            if not (nombre and especialidad and email and telefono):
                return JsonResponse({"success": False, "error": "Todos los campos obligatorios deben estar llenos."}, status=400)

            # 📌 1️⃣ Enviar correo a la empresa con los datos del médico
            subject_empresa = "Nueva solicitud de información de un médico"
            message_empresa = (
                f"Nombre: {nombre}\n"
                f"Especialidad: {especialidad}\n"
                f"Correo Electrónico: {email}\n"
                f"Teléfono: {telefono}\n"
                f"Mensaje:\n\n{mensaje if mensaje else 'Sin mensaje adicional.'}\n"
            )
            destinatario_empresa = "servesa07@gmail.com"
            send_mail(subject_empresa, message_empresa, 'servesa07@gmail.com', [destinatario_empresa])

            # 📌 2️⃣ Enviar respuesta automática al médico solicitante con imagen adjunta

            # Ruta de la imagen del logo
            logo_path = os.path.join(settings.MEDIA_ROOT, "profile_pictures/logos/logo1.png")

            # Estructura del correo en HTML con referencia a la imagen adjunta
            message_medico_html = """
            <html>
            <head>
                <style>
                    .email-container {{
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
                    }}
                    .email-header {{
                        background: linear-gradient(135deg, #392682 55%, #28ADA8 100%);
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }}
                    .email-header img {{
                        max-width: 120px;
                    }}
                    .email-body {{
                        padding: 20px;
                        color: #333;
                    }}
                    .email-body h2 {{
                        color: #392682;
                    }}
                    .email-footer {{
                        background: #f1f1f1;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <img src="cid:logo_meditest" alt="MediTest Logo">
                    </div>
                    <div class="email-body">
                        <h2>¡Gracias por tu interés en MediTest!</h2>
                        <p>Estimado/a <strong>{nombre}</strong>,</p>
                        <p>Nos complace saber que estás interesado en unirte a nuestra plataforma.</p>
                        <p>Para completar tu registro, necesitamos los siguientes documentos:</p>
                        <ul>
                            <li>✅ Certificado de especialidad médica</li>
                            <li>✅ Copia de tu licencia médica</li>
                            <li>✅ Identificación oficial</li>
                            <li>✅ Experiencia y referencias profesionales</li>
                        </ul>
                        <p><strong>Beneficios de unirte a MediTest:</strong></p>
                        <ul>
                            <li>🔹 Flexibilidad para gestionar tu agenda</li>
                            <li>🔹 Acceso a pacientes de distintas ubicaciones</li>
                            <li>🔹 Herramientas digitales para recetas y diagnósticos</li>
                            <li>🔹 Soporte técnico y administrativo continuo</li>
                        </ul>
                        <p>Adjunto encontrarás un contrato en borrador con más detalles sobre nuestra colaboración.</p>
                        <p>Si tienes preguntas, contáctanos al <strong>+591 68449128</strong> o responde a este correo.</p>
                        <p>Atentamente,<br><strong>Equipo de MediTest</strong></p>
                    </div>
                    <div class="email-footer">
                        © 2025 MediTest. Todos los derechos reservados.
                    </div>
                </div>
            </body>
            </html>
            """

            # Ruta del contrato en PDF
            contrato_path = os.path.join(settings.MEDIA_ROOT, "profile_pictures/contracts/Contrato_MediTest.pdf")

            # Crear el correo en formato HTML usando EmailMultiAlternatives
            email_medico = EmailMultiAlternatives(
                subject="Gracias por tu interés en MediTest",
                body="Este es un correo en formato HTML. Si ves esto, tu cliente de correo no soporta HTML.",
                from_email='servesa07@gmail.com',
                to=[email]
            )
            email_medico.attach_alternative(message_medico_html.format(nombre=nombre), "text/html")  # Adjuntar HTML

            # Adjuntar el logo con una Content ID (cid)
            if os.path.exists(logo_path):
                with open(logo_path, 'rb') as f:
                    logo_data = f.read()
                    logo_mime = MIMEImage(logo_data)  # Crear un objeto MIMEImage
                    logo_mime.add_header('Content-ID', '<logo_meditest>')  # Asignar Content-ID
                    logo_mime.add_header('Content-Disposition', 'inline', filename='logo1.png')  # Marcar como inline
                    email_medico.attach(logo_mime)  # Adjuntar la imagen

            # Adjuntar contrato si existe
            if os.path.exists(contrato_path):
                email_medico.attach_file(contrato_path)

            # Enviar el correo
            email_medico.send()

            return JsonResponse({"success": True, "message": "Solicitud enviada correctamente con imagen y contrato adjuntos"}, status=200)

        except Exception as e:
            print(f"Error en enviar_solicitud_medico: {e}")
            return JsonResponse({"success": False, "error": str(e)}, status=400)

    return JsonResponse({"success": False, "error": "Método no permitido"}, status=405)

