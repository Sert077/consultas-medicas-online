from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async  # Asegúrate de importar database_sync_to_async
import json
from .models import ChatMessage  # Importa el modelo de ChatMessage

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
        message = data['message']
        sender_id = data['sender_id']
        sender_name = data['sender_name']
        message_type = data.get('type', 'text')

        # Si es un mensaje de texto, guárdalo en la base de datos; si es imagen, no lo guarda
        if message_type == 'text':
            await self.save_message(self.chat_id, sender_id, sender_name, message)

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id,
                'sender_name': sender_name,
                'message_type': message_type
            }
        )

    # Guardar el mensaje en la base de datos de manera sincrónica
    @database_sync_to_async  # Usa database_sync_to_async en lugar de sync_to_async
    def save_message(self, chat_id, sender_id, sender_name, message):
        ChatMessage.objects.create(chat_id=chat_id, sender_id=sender_id, sender_name=sender_name, message=message)

    # Recibir mensaje del grupo de chat
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'type': event['message_type']
        }))
