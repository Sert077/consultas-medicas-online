import React, { useState } from 'react';

const EmailForm = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [recipient, setRecipient] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:8000/api/send-email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject,
                message,
                recipient,
            }),
        });

        const data = await response.json();
        setResponseMessage(data.message);
    };

    return (
        <div>
            <h2>Enviar Correo Electrónico</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Asunto:
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Mensaje:
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label>
                    Destinatario:
                    <input
                        type="email"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button type="submit">Enviar</button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default EmailForm;
