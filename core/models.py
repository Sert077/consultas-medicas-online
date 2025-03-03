from datetime import date
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class Doctor(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    specialty = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    address = models.CharField(max_length=255, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/')  # Campo para la foto de perfil
    biography = models.TextField(null=True, blank=True)
    days = models.CharField(max_length=50, null=True, blank=True)  # Días de atención (ejemplo: "L, M, X, J, V")
    start_time = models.TimeField(null=True, blank=True)  # Hora de inicio
    end_time = models.TimeField(null=True, blank=True)    # Hora de fin
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)  # Relación con el usuario
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.specialty}"
    

class Consulta(models.Model):
    paciente = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Permite valores nulos y en blanco
    medico = models.ForeignKey('Doctor', on_delete=models.CASCADE, null=True, blank=True)  # Permite valores nulos y en blanco
    fecha = models.DateField(null=True, blank=True)  # Permite valores nulos y en blanco
    hora = models.TimeField(null=True, blank=True)  # Permite valores nulos y en blanco
    estado = models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('realizada', 'Realizada'), ('cancelada', 'Cancelada')], default='pendiente')
    motivo_consulta = models.TextField(null=True, blank=True)  # Campo para el motivo de la consulta
    genero = models.CharField(
        max_length=10, 
        null=True, 
        blank=True
    )  # Género del paciente
    tipo_sangre = models.CharField(
        max_length=3,
        null=True, 
        blank=True
    )  # Tipo de sangre del paciente
    alergias = models.TextField(null=True, blank=True)  # Alergias del paciente
    edad = models.IntegerField(null=True, blank=True)  # Edad del paciente
    tipo_consulta = models.CharField(
        max_length=10,
        choices=[('presencial', 'Presencial'), ('virtual', 'Virtual')],
        default='virtual'
    )
    embarazo = models.BooleanField(null=True, blank=True)
    archivo_pdf = models.FileField(upload_to='profile_pictures/pdf_adjunt_consultas/', null=True, blank=True)
    token_reprogramacion = models.UUIDField(default=uuid.uuid4, unique=True, null=True, blank=True)
    
    def __str__(self):
        return f"Consulta con {self.medico} el {self.fecha} a las {self.hora}"
    
class Perfil(models.Model):
    USUARIO_CHOICES = [
        ('paciente', 'Paciente'),
        ('medico', 'Médico'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tipo_usuario = models.CharField(max_length=10, choices=USUARIO_CHOICES)
    birthdate = models.DateField(null=True, blank=True)  # Fecha de nacimiento
    phone_number = models.CharField(max_length=25, null=True, blank=True)  # Número de teléfono
    id_card = models.CharField(max_length=25, null=True, blank=True)  # Cédula de identidad
    user_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)  # Foto de perfil
    verificado = models.BooleanField(default=False)  # Estado de verificación

    def __str__(self):
        return f"{self.user.username} - {self.tipo_usuario}"

class ChatMessage(models.Model):
    chat_id = models.CharField(max_length=255)
    sender_id = models.IntegerField()
    sender_name = models.CharField(max_length=255, null=True)
    message = models.TextField(null=True, blank=True)  # Hacer que el mensaje sea opcional para admitir imágenes
    image = models.ImageField(upload_to='profile_pictures/chat_images/', null=True, blank=True)  # Agregar campo de imagen
    pdf = models.FileField(upload_to='profile_pictures/chat_pdfs/', null=True, blank=True)  # Nuevo campo para PDF
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.sender_id} in chat {self.chat_id}'


class EmailVerificationToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_token')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Receta(models.Model):
    consulta = models.ForeignKey('Consulta', on_delete=models.CASCADE, related_name='recetas')  # Relación con la consulta
    paciente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recetas')  # Relación con el paciente
    medico = models.ForeignKey('Doctor', on_delete=models.CASCADE, related_name='recetas')  # Relación con el médico

    # Datos relacionados con el paciente
    nombre_paciente = models.CharField(max_length=255)  # Nombre completo del paciente
    id_card = models.CharField(max_length=25)  # Cédula de identidad del paciente
    genero = models.CharField(max_length=10)  # Género del paciente
    tipo_sangre = models.CharField(max_length=3)  # Tipo de sangre
    alergias = models.TextField(null=True, blank=True)  # Alergias
    edad = models.IntegerField(null=True, blank=True)  # Edad del paciente

    # Datos adicionales de la receta
    peso = models.DecimalField(max_digits=5, decimal_places=2)  # Peso en kg
    talla = models.DecimalField(max_digits=5, decimal_places=2)  # Talla en cm o m
    diagnostico = models.TextField(null=True, blank=True)  # Diagnóstico médico
    tratamiento = models.TextField(null=True, blank=True)  # Medicamentos y tratamiento
    indicaciones = models.TextField(null=True, blank=True)  # Otras indicaciones (opcional)
    notas = models.TextField(null=True, blank=True)  # Notas adicionales (opcional)
    doc_receta = models.FileField(upload_to='profile_pictures/recetas/', null=True, blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)  # Fecha y hora de creación de la receta

    def __str__(self):
        return f"Receta de {self.nombre_paciente} - {self.consulta}"