import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../css/Chatbot.css";

const Chatbot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: "bot", text: "¡Hola! Soy el asistente virtual de MediTest. ¿En qué puedo ayudarte hoy?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const messagesEndRef = useRef(null);

    // Scroll automático
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (location.pathname === "/doctores") {
            setShowHint(true);
            const timer = setTimeout(() => setShowHint(false), 15000);
            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    if (
        location.pathname === "/" || 
        location.pathname === "/login" || 
        location.pathname.startsWith("/register") || 
        location.pathname.startsWith("/chat") ||
        location.pathname.startsWith("/historial-consultas") || 
        /^\/doctores\/\d+$/.test(location.pathname)
    ) {
        return null;
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return;
    
        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);
    
        try {
            // Instrucción personalizada según la ruta actual
            let instruction = "Eres un asistente virtual de MediTest, una plataforma para consultas médicas online. " +
                "Siempre recomienda consultar con un médico de MediTest o, si no es posible, acudir a un médico presencial. " +
                "Nunca proporciones diagnósticos médicos exactos ni recetas. ";
    
            if (location.pathname === "/doctores") {
                instruction += "Actualmente estás en la sección de doctores, por lo que si un usuario pregunta por un problema de salud, " +
                    "recomienda consultar directamente con uno de los médicos disponibles en la lista. " +
                    "Si es posible, sugiere que haga clic en 'Más información' para ver los detalles del médico.";
            }
    
            // Historial de la conversación
            const conversationHistory = newMessages.map(msg => ({
                role: msg.sender === "user" ? "user" : "model",
                parts: [{ text: msg.text }]
            }));
    
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", 
                {
                    contents: [
                        { role: "user", parts: [{ text: instruction }] }, // Instrucción para el asistente
                        ...conversationHistory,                           // Historial de la conversación
                        { role: "user", parts: [{ text: input }] }        // Nuevo mensaje del usuario
                    ]
                },
                {
                    headers: { "Content-Type": "application/json" },
                    params: { key: process.env.REACT_APP_GEMINI_API_KEY }
                }
            );
    
            const botResponse = response.data.candidates[0].content.parts[0].text;
    
            setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: botResponse }]);
        } catch (error) {
            console.log("Error al obtener respuesta del chatbot:", error.response ? error.response.data : error);
            setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "Lo siento, ocurrió un error. Intenta nuevamente." }]);
        } finally {
            setLoading(false);
        }
    };        

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            {showHint && (
                <div className="chatbot-hint">Si necesitas ayuda con la elección del médico, pregunta aquí 😊</div>
            )}
            <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
                <img src="/images/logo-ia2.png" alt="Chatbot MEDITEST" className="chatbot-icon" />
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <img src="/images/logo1.png" alt="MEDITEST Logo" className="chatbot-logo" />
                        <h3>Chat de Ayuda</h3>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chatbot-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-message bot">
                                <div className="loading-slide">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} /> 
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
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