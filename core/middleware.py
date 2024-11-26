from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async

class TokenAuthMiddleware:
    """
    Middleware que autentica usuarios en WebSockets utilizando un token de autenticación.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        token_key = None

        # Buscar el token en las cabeceras o en la query string
        if b'authorization' in headers:
            auth_header = headers[b'authorization'].decode().split()
            if len(auth_header) == 2 and auth_header[0].lower() == 'token':
                token_key = auth_header[1]
        elif 'token' in scope['query_string'].decode():
            query_params = dict(qc.split('=') for qc in scope['query_string'].decode().split('&'))
            token_key = query_params.get('token')

        # Autenticar al usuario si se encontró un token
        scope['user'] = await self.get_user(token_key) if token_key else AnonymousUser()
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return AnonymousUser()
