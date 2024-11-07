

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaImage, FaDownload, FaTimes, FaVideo } from 'react-icons/fa';
import '../css/ChatComponent.css';

const Chat = () => {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('paciente_id');
    const userName = localStorage.getItem('first_name');
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSendingImage, setIsSendingImage] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/chat/${chatId}/messages/`);
                setMessages(response.data);
            } catch (error) {
                console.error('Error al cargar mensajes anteriores:', error);
            }
        };

        fetchMessages();

        const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/`);
        setWs(socket);
        
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido:', data);
        
            setMessages(prevMessages => [...prevMessages, data]);
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
        if (isSendingImage) return; // Si ya se está enviando una imagen, salir de la función
        
        const file = e.target.files[0];
        if (file) {
            setIsSendingImage(true); // Activar bandera para bloquear envíos duplicados
    
            const formData = new FormData();
            formData.append('image', file);
            formData.append('sender_id', userId);
            formData.append('sender_name', userName);
    
            axios.post(`http://localhost:8000/api/chat/${chatId}/upload_image/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(response => {
                const newMessage = response.data;
                if (ws && ws.readyState === WebSocket.OPEN && !isSendingImage) { // Condición adicional
                    ws.send(JSON.stringify({
                        type: 'image',
                        image: newMessage.image, // URL de la imagen desde el servidor
                        sender_id: userId,
                        sender_name: userName
                    }));
                }
                setIsSendingImage(false); // Restablecer bandera después de que se haya enviado la imagen
                e.target.value = null; // Limpiar el archivo de entrada
            })
            .catch(error => {
                console.error('Error al enviar la imagen:', error);
                setIsSendingImage(false); // Restablecer bandera en caso de error
            });
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

    const openImagePreview = (image) => {
        setSelectedImage(image);
    };

    const closeImagePreview = () => {
        setSelectedImage(null);
    };

    const generateMeetLink = () => {
        const roomName = `reunion-${Date.now()}`;
        const jitsiLink = `https://meet.jit.si/${roomName}`;
        const linkMessage = `Únete a la reunión aquí: ${jitsiLink}`;
        setMessage(linkMessage);
        sendMessage();
    };

    const formatMessageWithLinks = (msg) => {
        if (!msg) return '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return msg.replace(urlRegex, (url) => <a href="${url}" target="_blank">${url}</a>);
    };

    return (
        <div className="chat-container">
            <h2>Chat</h2>
            <div className="meet-button-container">
                <button onClick={generateMeetLink} className="meet-button">
                    <FaVideo /> Meet
                </button>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender_id === userId ? 'my-message' : 'other-message'}>
                        <p><strong>{msg.sender_name}:</strong></p>
                        {msg.image ? (
                            <img 
                                src={`http://localhost:8000${msg.image}`} 
                                alt="Mensaje enviado" 
                                style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }} 
                                onClick={() => openImagePreview(`http://localhost:8000${msg.image}`)}
                            />
                        ) : (
                            <p dangerouslySetInnerHTML={{ __html: formatMessageWithLinks(msg.message) }}></p>
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
                        <FaImage className="image-icon" />
                    </label>
                    <input type="file" accept="image/*" onChange={sendImage} style={{ display: 'none' }} id="file-upload" />
                    <button onClick={sendMessage}>Enviar</button>
                </div>
            </div>

            {selectedImage && (
                <div className="image-preview-overlay" onClick={closeImagePreview}>
                    <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Imagen en previsualización" />
                        <a href={selectedImage} download className="download-icon" onClick={(e) => e.stopPropagation()}>
                            <FaDownload />
                        </a>
                        <button className="close-icon" onClick={closeImagePreview}>
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;