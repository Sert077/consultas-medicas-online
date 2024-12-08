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
    horario_atencion = models.CharField(max_length=100, null=True, blank=True)  # Campo para el horario de atención
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

    def __str__(self):
        return f"{self.user.username} - {self.tipo_usuario}"

class ChatMessage(models.Model):
    chat_id = models.CharField(max_length=255)
    sender_id = models.IntegerField()
    sender_name = models.CharField(max_length=255, null=True)
    message = models.TextField(null=True, blank=True)  # Hacer que el mensaje sea opcional para admitir imágenes
    image = models.ImageField(upload_to='profile_pictures/chat_images/', null=True, blank=True)  # Agregar campo de imagen
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from {self.sender_id} in chat {self.chat_id}'

class Chat(models.Model):
    paciente = models.ForeignKey(User, on_delete=models.CASCADE)
    medico = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)  # User será paciente o médico
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

#@receiver(post_save, sender=User)
#def crear_perfil(sender, instance, created, **kwargs):
#    if created:
#        Perfil.objects.create(user=instance)

#@receiver(post_save, sender=User)
#def guardar_perfil(sender, instance, **kwargs):
#    instance.perfil.save()

