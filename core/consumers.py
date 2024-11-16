from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile  # Importa ContentFile para guardar archivos
import json
import base64  # Importa base64 para decodificar la imagen
from .models import ChatMessage
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

connected_users = {}  # Diccionario global para rastrear usuarios conectados

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f'chat_{self.chat_id}'
        self.user_id = self.scope['user'].id  # ID del usuario conectado

        # Añadir al grupo del chat
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Añadir al diccionario de usuarios conectados
        connected_users[self.user_id] = True
        await self.notify_users_status()

    async def disconnect(self, close_code):
        # Eliminar del diccionario de usuarios conectados
        if self.user_id in connected_users:
            connected_users.pop(self.user_id)

        # Notificar a los demás usuarios
        await self.notify_users_status()

        # Retirar del grupo del chat
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notify_users_status(self):
        # Enviar la lista de usuarios conectados al grupo
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'user_status',
                'connected_users': list(connected_users.keys()),
            }
        )

    async def user_status(self, event):
        # Enviar datos del estado al frontend
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'connected_users': event['connected_users'],
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        sender_id = data['sender_id']
        sender_name = data['sender_name']
        message_type = data.get('type', 'text')

        image_url = None
        if message_type == 'image':
            # La URL de la imagen ya fue procesada y enviada por la API
            image_url = data['image']
        else:
            await self.save_message(self.chat_id, sender_id, sender_name, message)

        # Enviar notificación a los clientes WebSocket
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id,
                'sender_name': sender_name,
                'message_type': message_type,
                'image': image_url if message_type == 'image' else None
            }
        )


    @database_sync_to_async
    def save_message(self, chat_id, sender_id, sender_name, message, image=None):
        ChatMessage.objects.create(chat_id=chat_id, sender_id=sender_id, sender_name=sender_name, message=message, image=image)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'type': event['message_type'],
            'image': event.get('image')  # Enviar URL de la imagen
        }))