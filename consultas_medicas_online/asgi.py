"""
ASGI config for consultas_medicas_online project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

# consultas_medicas_online/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from core.middleware import TokenAuthMiddleware
from core import routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "consultas_medicas_online.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})







