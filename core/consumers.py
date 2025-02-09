from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.files.base import ContentFile  # Importa ContentFile para guardar archivos
import json
import base64  # Importa base64 para decodificar la imagen
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f'chat_{self.chat_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Notificar que el usuario está en línea
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': f"Está en línea",
                'sender_id': None,
                'sender_name': self.scope['user'].first_name,
                'message_type': 'status',
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        # Notificar que el usuario se desconectó
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': f"Se desconectó",
                'sender_id': None,
                'sender_name': self.scope['user'].first_name,
                'message_type': 'status',
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        sender_id = data['sender_id']
        sender_name = data['sender_name']
        message_type = data.get('type', 'text')

        image_url = None
        pdf_url = None

        if message_type == 'image':
            image_url = data['image']
        elif message_type == 'pdf':
            pdf_url = data['pdf']  # La URL ya fue enviada por la API
        else:
            await self.save_message(self.chat_id, sender_id, sender_name, message)

        # Enviar mensaje a los clientes WebSocket
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id,
                'sender_name': sender_name,
                'message_type': message_type,
                'image': image_url if message_type == 'image' else None,
                'pdf': pdf_url if message_type == 'pdf' else None
            }
        )


    @database_sync_to_async
    def save_message(self, chat_id, sender_id, sender_name, message, image=None, pdf=None):
        ChatMessage.objects.create(chat_id=chat_id, sender_id=sender_id, sender_name=sender_name, message=message, image=image, pdf=pdf)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'type': event['message_type'],
            'image': event.get('image'),
            'pdf': event.get('pdf')
        }))