import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/ChatComponent.css';

const Chat = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('paciente_id');
    const userName = localStorage.getItem('first_name');
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    // Obtener los mensajes anteriores del backend y cargar imágenes del localStorage
    useEffect(() => {
        // Cargar mensajes desde el backend
        axios.get(`http://localhost:8000/api/chat/${chatId}/messages/`)
            .then(response => {
                // Cargar imágenes desde localStorage
                const savedImages = JSON.parse(localStorage.getItem('chatImages')) || [];
                const allMessages = [...response.data, ...savedImages]; // Combinar mensajes
                
                // Filtrar duplicados antes de establecer el estado
                const uniqueMessages = allMessages.filter((msg, index, self) =>
                    index === self.findIndex((m) => m.message === msg.message && m.sender_id === msg.sender_id)
                );

                setMessages(uniqueMessages);
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

            // Almacenar la imagen en localStorage si es un mensaje de tipo imagen
            if (data.type === 'image') {
                const savedImages = JSON.parse(localStorage.getItem('chatImages')) || [];
                savedImages.push(data); // Agregar la imagen al arreglo
                localStorage.setItem('chatImages', JSON.stringify(savedImages));
            }

            // Solo agregar el mensaje si no existe ya en messages
            setMessages(prevMessages => {
                const messageExists = prevMessages.some(msg => msg.message === data.message && msg.sender_id === data.sender_id);
                if (!messageExists) {
                    return [...prevMessages, data]; // Agregar mensaje al estado
                }
                return prevMessages; // No agregar si ya existe
            });
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

    const sendImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imgData = {
                    message: reader.result, // Guardar imagen en formato Base64
                    sender_id: userId,
                    sender_name: userName,
                    type: 'image' // Añadir tipo de mensaje
                };

                // Guardar imagen en el localStorage
                const savedImages = JSON.parse(localStorage.getItem('chatImages')) || [];
                savedImages.push(imgData); // Agregar imagen al arreglo
                localStorage.setItem('chatImages', JSON.stringify(savedImages));

                // Enviar la imagen a través del WebSocket
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(imgData)); // Enviar solo la imagen
                }
                // No agregar la imagen al estado aquí
            };
            reader.readAsDataURL(file); // Leer la imagen como URL de datos
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
                        <p><strong>{msg.sender_name}:</strong></p>
                        {msg.type === 'image' ? (
                            <img 
                                src={msg.message} 
                                alt="Mensaje enviado" 
                                style={{ maxWidth: '100%', height: 'auto' }} 
                            />
                        ) : (
                            <p>{msg.message}</p>
                        )}
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
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={sendImage} 
                    style={{ display: 'none' }} 
                    id="file-upload" 
                />
                <label htmlFor="file-upload" className="custom-file-upload">
                    Enviar Imagen
                </label>
            </div>
        </div>
    );
};

export default Chat;
