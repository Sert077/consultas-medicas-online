from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

User = get_user_model()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        token_key = None

        # Buscar token en la query string
        if b'authorization' in headers:
            auth_header = headers[b'authorization'].decode().split()
            if len(auth_header) == 2 and auth_header[0].lower() == 'bearer':
                token_key = auth_header[1]
        elif 'token' in scope['query_string'].decode():
            query_params = dict(qc.split('=') for qc in scope['query_string'].decode().split('&'))
            token_key = query_params.get('token')

        scope['user'] = await self.get_user_from_token(token_key)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token_key):
        try:
            # Valida el token y extrae el usuario
            valid_data = JWTAuthentication().get_validated_token(token_key)
            user = JWTAuthentication().get_user(valid_data)
            return user
        except (InvalidToken, TokenError, Exception) as e:
            print(f"JWT Error: {e}")
            return AnonymousUser()
