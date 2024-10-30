import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaImage } from 'react-icons/fa'; // Importamos el ícono de imagen de react-icons/fa
import '../css/ChatComponent.css';

const Chat = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('paciente_id');
    const userName = localStorage.getItem('first_name');
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/chat/${chatId}/messages/`)
            .then(response => {
                const savedImages = JSON.parse(localStorage.getItem('chatImages')) || [];
                const allMessages = [...response.data, ...savedImages];
                
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
        const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
        setWs(socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido:', data);

            if (data.type === 'image') {
                const savedImages = JSON.parse(localStorage.getItem('chatImages')) || [];
                savedImages.push(data);
                localStorage.setItem('chatImages', JSON.stringify(savedImages));
            }

            setMessages(prevMessages => {
                const messageExists = prevMessages.some(msg => msg.message === data.message && msg.sender_id === data.sender_id);
                if (!messageExists) {
                    return [...prevMessages, data];
                }
                return prevMessages;
            });
        };

        socket.onclose = () => console.log('WebSocket desconectado');
        
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
                    'sender_name': userName 
                }));
                setMessage('');
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
                    message: reader.result,
                    sender_id: userId,
                    sender_name: userName,
                    type: 'image'
                };

                const savedImages = JSON.parse(localStorage.getItem('chatImages')) || [];
                savedImages.push(imgData);
                localStorage.setItem('chatImages', JSON.stringify(savedImages));

                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(imgData));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

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
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
        <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe un mensaje..."
        />
        <label htmlFor="file-upload" className="custom-file-upload">
            <FaImage className="image-icon" /> {/* Icono de imagen */}
        </label>
        <input type="file" accept="image/*" onChange={sendImage} style={{ display: 'none' }} id="file-upload" />
        <button onClick={sendMessage}>Enviar</button>
    </div>
</div>
        </div>
    );
};

export default Chat;
