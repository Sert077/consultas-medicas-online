from django.core.mail import send_mail
from django.conf import settings

def enviar_correo(subject, message, recipient_list):
    """
    Envía un correo electrónico utilizando el servicio configurado.
    """
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,  # Dirección de correo del remitente
            recipient_list,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error al enviar correo: {e}")
        return False
