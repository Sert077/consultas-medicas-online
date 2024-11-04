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

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        sender_id = data['sender_id']
        sender_name = data['sender_name']
        message_type = data.get('type', 'text')

        if message_type == 'image':
            image_data = data['message']  # La imagen en base64
            image_file = ContentFile(base64.b64decode(image_data.split(',')[1]), name=f"{sender_id}_{self.chat_id}.png")
            await self.save_message(self.chat_id, sender_id, sender_name, None, image_file)
        else:
            await self.save_message(self.chat_id, sender_id, sender_name, message)

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id,
                'sender_name': sender_name,
                'message_type': message_type,
                'image': image_data if message_type == 'image' else None
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
            'image': event.get('image')  # Incluir la imagen en el mensaje
        }))
