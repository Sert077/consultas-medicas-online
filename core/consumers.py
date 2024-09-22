# consumers.py
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage, Consulta
from django.contrib.auth.models import User
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.consulta_id = self.scope['url_route']['kwargs']['consulta_id']
        self.chat_group_name = f'chat_{self.consulta_id}'

        # Unirse al grupo de la consulta
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Salir del grupo de la consulta
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    # Recibir mensaje desde WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender_id = text_data_json['sender']
        receiver_id = text_data_json['receiver']

        # Consultas de base de datos envueltas en sync_to_async
        sender = await sync_to_async(User.objects.get)(id=sender_id)
        receiver = await sync_to_async(User.objects.get)(id=receiver_id)
        consulta = await sync_to_async(Consulta.objects.get)(id=self.consulta_id)

        # Guardar el mensaje en la base de datos
        await sync_to_async(ChatMessage.objects.create)(
            consulta=consulta, sender=sender, receiver=receiver, message=message)

        # Enviar el mensaje al grupo de la consulta
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender.username
            }
        )

    # Recibir mensaje del grupo de la consulta
    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        # Enviar mensaje a WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))
