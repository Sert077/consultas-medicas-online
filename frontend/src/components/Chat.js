import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/ChatComponent.css';

const Chat = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('paciente_id');
    const userName = localStorage.getItem('first_name'); // Nombre del usuario logueado
    const [ws, setWs] = useState(null); // Manejando WebSocket como estado
    const messagesEndRef = useRef(null); // Referencia para scroll al final del chat

    // Obtener los mensajes anteriores del backend
    useEffect(() => {
        axios.get(`http://localhost:8000/api/chat/${chatId}/messages/`)
            .then(response => {
                // Asegúrate de que los mensajes anteriores incluyan sender_name
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Error al cargar mensajes anteriores:', error);
            });
    }, [chatId]);

    useEffect(() => {
        // Crear WebSocket al montar el componente
        const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
        setWs(socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido:', data);  // Para depuración
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        socket.onclose = () => console.log('WebSocket desconectado');
        
        // Limpiar conexión de WebSocket cuando se desmonte el componente
        return () => {
            socket.close();
        };
    }, [chatId]);

    const sendMessage = () => {
        if (message.trim()) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    'message': message,
                    'sender_id': userId,
                    'sender_name': userName // Enviar nombre del usuario
                }));
    
                setMessage(''); // Limpiar campo de texto
            } else {
                console.error('WebSocket no está conectado.');
            }
        }
    };

    // Función para manejar el envío al presionar la tecla "Enter"
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evitar el comportamiento por defecto de 'Enter'
            sendMessage();
        }
    };

    // Desplazar automáticamente al último mensaje
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="chat-container">
            <h2>Chat</h2>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender_id === userId ? 'my-message' : 'other-message'}>
                        {/* Mostrar nombre del remitente */}
                        <p><strong>{msg.sender_name}:</strong> {msg.message}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Referencia para el scroll */}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default Chat;
