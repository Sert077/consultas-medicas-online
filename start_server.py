import os
import uvicorn
import django

if __name__ == "__main__":
    # Establecer la variable de entorno para Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "consultas_medicas_online.settings")
    
    # Inicializar Django
    django.setup()

    # Importa y ejecuta el script de limpieza
    # from core.cleanup_inactive import eliminar_usuarios_inactivos
    # eliminar_usuarios_inactivos()
    
    # Ejecutar Uvicorn
    uvicorn.run("consultas_medicas_online.asgi:application", host="127.0.0.1", port=8000, log_level="info")
