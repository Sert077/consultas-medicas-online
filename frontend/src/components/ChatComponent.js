import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/ChatComponent.css';

const ChatComponent = () => {
    const { consultaId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        console.log("Consulta ID:", consultaId);
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${consultaId}/`);

        ws.onopen = () => {
            console.log("Conexión WebSocket establecida.");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        ws.onclose = () => {
            console.log("WebSocket cerrado.");
        };

        ws.onerror = (error) => {
            console.error("Error en la conexión WebSocket:", error);
        };

        return () => {
            ws.close();
        };
    }, [consultaId]);

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN && newMessage.trim()) {
            const messageData = {
                message: newMessage,
                sender: localStorage.getItem('paciente_id'),
                receiver: localStorage.getItem('medico_id'),
            };
            socket.send(JSON.stringify(messageData));
            setNewMessage('');
        } else {
            console.error("WebSocket no está conectado o el mensaje está vacío");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
};

export default ChatComponent;
