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
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
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
        // Recepción de mensajes desde el WebSocket
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Verifica si el mensaje recibido contiene `sender_name`
            console.log('Mensaje recibido:', data);  // Añade esta línea para depuración
            
            // Asegúrate de que data tenga `sender_name`
            setMessages((prevMessages) => [...prevMessages, data]);
        };
    
        // Limpiar conexión de WebSocket cuando se desmonte el componente
        return () => {
            ws.close();
        };
    }, [ws]);
    

    const sendMessage = () => {
        if (message.trim()) {
            ws.send(JSON.stringify({
                'message': message,
                'sender_id': userId,
                'sender_name': userName // Enviar nombre del usuario
            }));

            // Actualizar la lista de mensajes localmente para mostrarlo de inmediato
            setMessages((prevMessages) => [
                ...prevMessages,
                { message, sender_id: userId, sender_name: userName }
            ]);

            setMessage(''); // Limpiar campo de texto
        }
    };

    // Función para manejar el envío al presionar la tecla "Enter"
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
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
