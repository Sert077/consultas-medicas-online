import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaImage, FaDownload, FaTimes, FaVideo, FaUser } from 'react-icons/fa';
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
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [displayName, setDisplayName] = useState('');
    const tipoUsuario = localStorage.getItem('tipo_usuario');

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                if (tipoUsuario === 'paciente') {
                    const response = await axios.get(`http://localhost:8000/api/chat/${chatId}/doctor/`);
                    setDisplayName(`${response.data.first_name} ${response.data.last_name}`);
                } else if (tipoUsuario === 'medico') {
                    const consultaResponse = await axios.get(`http://localhost:8000/api/chat/${chatId}/consulta/`);
                    const pacienteId = consultaResponse.data.paciente_id;
                    const pacienteResponse = await axios.get(`http://localhost:8000/api/users/${pacienteId}/`);
                    setDisplayName(`${pacienteResponse.data.first_name} ${pacienteResponse.data.last_name}`);
                }
            } catch (error) {
                console.error('Error al obtener el nombre:', error);
            }
        };

        fetchDisplayName();
    }, [chatId, tipoUsuario]);

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

        const token = localStorage.getItem('token');
        const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}/?token=${token}`);
        setWs(socket);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'user_status') {
                setConnectedUsers(data.connected_users);
            } else {
                console.log('Mensaje recibido:', data);
                setMessages((prevMessages) => [...prevMessages, data]);
            }
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
            const formData = new FormData();
            formData.append('image', file);
            formData.append('sender_id', userId);
            formData.append('sender_name', userName);

            axios
                .post(`http://localhost:8000/api/chat/${chatId}/upload_image/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((response) => {
                    const newMessage = response.data;
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            'type': 'image',
                            'image': newMessage.image,
                            'sender_id': userId,
                            'sender_name': userName,
                            'id': newMessage.id,
                        }));
                    }

                    setMessages((prevMessages) => {
                        const isDuplicate = prevMessages.some((msg) => msg.id === newMessage.id);
                        if (!isDuplicate) {
                            return [...prevMessages, newMessage];
                        }
                        return prevMessages;
                    });

                    e.target.value = null;
                })
                .catch((error) => {
                    console.error('Error al enviar la imagen:', error);
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
        return msg.split(urlRegex).map((part, index) =>
            urlRegex.test(part) ? (
                <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
            ) : (
                part
            )
        );
    };

    // Filtrar solo mensajes de tipo "status"
    const statusMessages = messages.filter(msg => msg.type === 'status');

    return (
        <div className="chat-container">
            <h2>Chat</h2>
            

          <div className="doctor-infochat">
            <FaUser className="doctor-iconchat" />
            <span>
                {tipoUsuario === 'paciente' ? `Dr(a): ${displayName}` : displayName}
            </span>

            {/* Aquí mostramos solo el estado sin el nombre del usuario */}
            {statusMessages.length > 0 && (
                <div className="status-container">
                    <p>{statusMessages[statusMessages.length - 1].message}</p>
                </div>
            )}

            {/* Botón Meet alineado con el nombre y estado */}
            <div className="meet-button-container">
                <button onClick={generateMeetLink} className="meet-button">
                    <FaVideo /> Meet
                </button>
            </div>
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
                            <p>{formatMessageWithLinks(msg.message)}</p>
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
