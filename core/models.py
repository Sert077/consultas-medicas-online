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

    def __str__(self):
        return f"{self.user.username} - {self.tipo_usuario}"
    
#@receiver(post_save, sender=User)
#def crear_perfil(sender, instance, created, **kwargs):
#    if created:
#        Perfil.objects.create(user=instance)

#@receiver(post_save, sender=User)
#def guardar_perfil(sender, instance, **kwargs):
#    instance.perfil.save()

