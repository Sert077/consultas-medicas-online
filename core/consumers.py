from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async  # Asegúrate de importar database_sync_to_async
import json
from .models import ChatMessage  # Importa el modelo de ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f'chat_{self.chat_id}'

        # Unirse al grupo de chat
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Salir del grupo de chat
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Recibir mensaje del WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_id = data['sender_id']

        # Guardar el mensaje en la base de datos
        await self.save_message(self.chat_id, sender_id, message)

        # Enviar mensaje al grupo de chat
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': sender_id
            }
        )

    # Guardar el mensaje en la base de datos de manera sincrónica
    @database_sync_to_async  # Usa database_sync_to_async en lugar de sync_to_async
    def save_message(self, chat_id, sender_id, message):
        ChatMessage.objects.create(chat_id=chat_id, sender_id=sender_id, message=message)

    # Recibir mensaje del grupo de chat
    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']

        # Enviar mensaje al WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender_id': sender_id
        }))
