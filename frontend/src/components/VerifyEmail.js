import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import '../css/VerifyEmail.css'; // Asegúrate de enlazar el archivo de estilos

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState(null); // Estado para manejar el mensaje
    const hasVerified = useRef(false); // Evitar dobles peticiones

    useEffect(() => {
        if (hasVerified.current) return; // Si ya se ejecutó, no hacemos nada

        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/verify-email/${token}/`);
                if (response.ok) {
                    setStatus({ success: true, message: "Correo verificado exitosamente, Ahora puedes iniciar sesión." });
                } else {
                    setStatus({ success: false, message: "Token inválido o expirado." });
                }
            } catch (error) {
                setStatus({ success: false, message: "Error al verificar el correo." });
                console.error("Error al verificar el correo:", error);
            }
        };

        verifyEmail();
        hasVerified.current = true; // Marcar como ejecutado
    }, [token]);

    return (
        <div className="verify-email-container">
            <h2>Verificación de correo</h2>
            {status ? (
                <div className={`message ${status.success ? 'success' : 'error'}`}>
                    {status.message}
                </div>
            ) : (
                <div className="message">Verificando correo, por favor espera...</div>
            )}
        </div>
    );
};

export default VerifyEmail;
