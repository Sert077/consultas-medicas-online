import React, { useState, useEffect } from 'react';

const Chat = ({ consultaId, userId, receiverId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/chat/${consultaId}/`);
        setSocket(socket);

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        return () => {
            socket.close();
        };
    }, [consultaId]);

    const sendMessage = () => {
        if (socket && newMessage) {
            socket.send(JSON.stringify({
                'message': newMessage,
                'sender': userId,
                'receiver': receiverId,
            }));
            setNewMessage('');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Enviar</button>
        </div>
    );
};

export default Chat;
