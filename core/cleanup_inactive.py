from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from core.models import Perfil
import os

def eliminar_usuarios_inactivos():
    años_inactividad = 10
    fecha_limite = timezone.now() - timedelta(days=años_inactividad * 365)

    # Buscar pacientes inactivos (último login nulo o muy antiguo)
    pacientes_inactivos = Perfil.objects.filter(
        tipo_usuario="paciente",
        user__isnull=False
    ).exclude(
        user__date_joined__gt=fecha_limite  # Excluir recién registrados
    ).filter(
        Q(user__last_login__lt=fecha_limite) | Q(user__last_login__isnull=True)
    )

    eliminados = 0

    for perfil in pacientes_inactivos:
        user = perfil.user
        print(f"Eliminando paciente inactivo: {user.username} (Registrado: {user.date_joined})")
        
        # Eliminar imagen si existe
        if perfil.user_picture and hasattr(perfil.user_picture, 'path'):
            try:
                os.remove(perfil.user_picture.path)
            except:
                pass
        
        user.delete()
        eliminados += 1

    print(f"Total eliminados: {eliminados}")
