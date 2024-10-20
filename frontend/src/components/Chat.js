import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener axios instalado
import '../css/ChatComponent.css';

const Chat = () => {
    const { chatId } = useParams(); // Obtener el ID del chat desde la URL
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('paciente_id'); // ID del usuario logueado
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);

    // Obtener los mensajes anteriores del backend
    useEffect(() => {
        axios.get(`http://localhost:8000/api/chat/${chatId}/messages/`)
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Error al cargar mensajes anteriores:', error);
            });
    }, [chatId]);

    useEffect(() => {
        // Recepción de mensajes desde el WebSocket
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        // Limpiar conexión de WebSocket cuando se desmonte el componente
        return () => {
            ws.close();
        };
    }, [ws]);

    const sendMessage = () => {
        if (message.trim()) {
            // Enviar el mensaje al servidor a través del WebSocket
            ws.send(JSON.stringify({
                'message': message,
                'sender_id': userId
            }));

            // Actualizar la lista de mensajes localmente sin esperar la respuesta del WebSocket
            setMessages((prevMessages) => [
                ...prevMessages, 
                { message, sender_id: userId }
            ]);

            // Limpiar el campo de entrada de texto
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Chat</h2>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender_id === userId ? 'my-message' : 'other-message'}>
                        <p>{msg.message}</p>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default Chat;
