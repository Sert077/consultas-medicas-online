import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../css/Chatbot.css";

const Chatbot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: "bot", text: "¡Hola! ¿En qué puedo ayudarte?" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showHint, setShowHint] = useState(false);
    
    useEffect(() => {
        if (location.pathname === "/doctores") {
            setShowHint(true);
            const timer = setTimeout(() => {
                setShowHint(false);
            }, 15000); // 15 segundos
        
            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    // Ocultar chatbot en Home, Login, Registro, Chat y Detalles de doctor
    if (
        location.pathname === "/" || 
        location.pathname === "/login" || 
        location.pathname.startsWith("/register") || 
        location.pathname.startsWith("/chat") || 
        /^\/doctores\/\d+$/.test(location.pathname)
    ) {
        return null;
    }

    // Función para enviar mensaje a Gemini
    const handleSendMessage = async () => {
        if (!input.trim()) return;
    
        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
    
        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                {
                    contents: [
                        { role: "user", parts: [{ text: input }] }
                    ]
                },
                {
                    headers: { "Content-Type": "application/json" },
                    params: { key: process.env.REACT_APP_GEMINI_API_KEY }
                }
            );
    
            const botResponse = response.data.candidates[0].content.parts[0].text;
    
            setMessages([...newMessages, { sender: "bot", text: botResponse }]);
        } catch (error) {
            console.log("Error al obtener respuesta del chatbot:", error.response ? error.response.data : error);
            setMessages([...newMessages, { sender: "bot", text: "Lo siento, ocurrió un error. Intenta nuevamente." }]);
        } finally {
            setLoading(false);
        }
    };   
    
    return (
        <div className="chatbot-container">
            {showHint && (
                <div className="chatbot-hint">Si necesitas ayuda con la elección del médico, pregunta aquí 😊</div>
            )}
            <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
                <img src="/images/logo-ia.png" alt="Chatbot MEDITEST" className="chatbot-icon" />
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <img src="/images/logo.png" alt="MEDITEST Logo" className="chatbot-logo" />
                        <h3>Chat de Ayuda</h3>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chatbot-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && <div className="chatbot-message bot">...</div>}
                    </div>
                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje..."
                        />
                        <button onClick={handleSendMessage} disabled={loading}>
                            Enviar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
