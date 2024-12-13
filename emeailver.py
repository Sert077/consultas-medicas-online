from django.core.mail import send_mail
from django.conf import settings

try:
    send_mail(
        'Prueba de correo',
        'Este es un mensaje de prueba.',
        settings.EMAIL_HOST_USER,
        ['correo_destino@example.com'],
        fail_silently=False,
    )
    print("Correo enviado exitosamente.")
except Exception as e:
    print(f"Error al enviar correo: {e}")
