from datetime import date
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.encryption_utils import encrypt_data, decrypt_data

# Create your models here.

class Doctor(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    specialty = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/')  # Campo para la foto de perfil
    biography = models.TextField(null=True, blank=True)
    days = models.CharField(max_length=50, null=True, blank=True)  # Días de atención (ejemplo: "L, M, X, J, V")
    start_time = models.TimeField(null=True, blank=True)  # Hora de inicio
    end_time = models.TimeField(null=True, blank=True)    # Hora de fin
    consulta_duracion = models.CharField(max_length=10, null=True, blank=True)  # Duración de la consulta
    modalidad_consulta = models.CharField(max_length=15, choices=[('presencial', 'Presencial'), ('virtual', 'Virtual'), ('hibrida', 'Hibrida')], null=True, blank=True)  # Modalidad de la consulta
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)  # Relación con el usuario
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.phone_number:
            self.phone_number = encrypt_data(self.phone_number)
        if self.address:
            self.address = encrypt_data(self.address)
        if self.biography:
            self.biography = encrypt_data(self.biography)
        super().save(*args, **kwargs)

    def get_phone_number(self):
        return decrypt_data(self.phone_number) if self.phone_number else None
    
    def get_address(self):
        return decrypt_data(self.address) if self.address else None
    
    def get_biography(self):
        return decrypt_data(self.biography) if self.biography else None

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.specialty}"
    

class Consulta(models.Model):
    paciente = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Permite valores nulos y en blanco
    medico = models.ForeignKey('Doctor', on_delete=models.CASCADE, null=True, blank=True)  # Permite valores nulos y en blanco
    fecha = models.DateField(null=True, blank=True)  # Permite valores nulos y en blanco
    hora = models.TimeField(null=True, blank=True)  # Permite valores nulos y en blanco
    estado = models.CharField(
        max_length=255, 
        choices=[('pendiente', 'Pendiente'), ('realizada', 'Realizada'), ('cancelada', 'Cancelada'), ('reprogramada', 'Reprogramada')], 
        default='pendiente')
    motivo_consulta = models.TextField(null=True, blank=True)  # Campo para el motivo de la consulta
    genero = models.CharField(
        max_length=255, 
        null=True, 
        blank=True
    )  # Género del paciente
    tipo_sangre = models.CharField(max_length=255, null=True, blank=True)
    alergias = models.TextField(null=True, blank=True)
    edad = models.IntegerField(null=True, blank=True)  # Edad del paciente
    tipo_consulta = models.CharField(
        max_length=10,
        choices=[('presencial', 'Presencial'), ('virtual', 'Virtual')],
        default='virtual'
    )
    embarazo = models.BooleanField(null=True, blank=True)
    enfermedad_base = models.TextField(null=True, blank=True)  # Enfermedades base del paciente
    medicacion = models.TextField(null=True, blank=True)  # Medicación actual del paciente
    cirugia = models.TextField(null=True, blank=True)  # Cirugías previas del paciente
    archivo_pdf = models.FileField(upload_to='profile_pictures/pdf_adjunt_consultas/', null=True, blank=True)
    token_reprogramacion = models.UUIDField(default=uuid.uuid4, unique=True, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        for field in ['motivo_consulta', 'genero', 'tipo_sangre', 'alergias', 'enfermedad_base', 'medicacion', 'cirugia']:
            value = getattr(self, field)
            if value:
                setattr(self, field, encrypt_data(value))
        super().save(*args, **kwargs)

    def get_motivo_consulta(self):
        return decrypt_data(self.motivo_consulta) if self.motivo_consulta else None

    def get_genero(self):
        return decrypt_data(self.genero) if self.genero else None

    def get_tipo_sangre(self):
        return decrypt_data(self.tipo_sangre) if self.tipo_sangre else None

    def get_alergias(self):
        return decrypt_data(self.alergias) if self.alergias else None

    def get_enfermedad_base(self):
        return decrypt_data(self.enfermedad_base) if self.enfermedad_base else None

    def get_medicacion(self):
        return decrypt_data(self.medicacion) if self.medicacion else None

    def get_cirugia(self):
        return decrypt_data(self.cirugia) if self.cirugia else None

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
    phone_number = models.CharField(max_length=255, null=True, blank=True)  # Número de teléfono
    id_card = models.CharField(max_length=255, null=True, blank=True)  # Cédula de identidad
    user_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)  # Foto de perfil
    verificado = models.BooleanField(default=False)  # Estado de verificación

    def save(self, *args, **kwargs):
        if self.phone_number:
            self.phone_number = encrypt_data(self.phone_number)
        if self.id_card:
            self.id_card = encrypt_data(self.id_card)
        super().save(*args, **kwargs)

    def get_phone_number(self):
        return decrypt_data(self.phone_number) if self.phone_number else None

    def get_id_card(self):
        return decrypt_data(self.id_card) if self.id_card else None

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
    
    def save(self, *args, **kwargs):
        if self.message:
            self.message = encrypt_data(self.message)
        super().save(*args, **kwargs)

    def get_message(self):
        return decrypt_data(self.message) if self.message else None

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
    id_card = models.CharField(max_length=255)  # Cédula de identidad del paciente
    genero = models.CharField(
        max_length=255, 
        null=True, 
        blank=True
    )  # Género del paciente  # Género del paciente
    tipo_sangre = models.CharField(max_length=255)  # Tipo de sangre
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

    def save(self, *args, **kwargs):
        for field in ['nombre_paciente', 'id_card', 'genero', 'tipo_sangre', 'alergias', 'diagnostico', 'tratamiento', 'indicaciones', 'notas']:
            value = getattr(self, field)
            if value:
                setattr(self, field, encrypt_data(value))
        super().save(*args, **kwargs)

    def get_nombre_paciente(self):
        return decrypt_data(self.nombre_paciente) if self.nombre_paciente else None
    
    def get_id_card(self):
        return decrypt_data(self.id_card) if self.id_card else None
    
    def get_genero(self):
        return decrypt_data(self.genero) if self.genero else None
    
    def get_tipo_sangre(self):  
        return decrypt_data(self.tipo_sangre) if self.tipo_sangre else None
    
    def get_alergias(self):
        return decrypt_data(self.alergias) if self.alergias else None

    def get_diagnostico(self):
        return decrypt_data(self.diagnostico) if self.diagnostico else None
    
    def get_tratamiento(self):
        return decrypt_data(self.tratamiento) if self.tratamiento else None
    
    def get_indicaciones(self): 
        return decrypt_data(self.indicaciones) if self.indicaciones else None
    
    def get_notas(self):
        return decrypt_data(self.notas) if self.notas else None

    def __str__(self):
        return f"Receta de {self.nombre_paciente} - {self.consulta}"