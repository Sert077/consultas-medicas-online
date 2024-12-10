import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VerifyEmail = () => {
    const { token } = useParams();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/verify-email/${token}/`);
                if (response.ok) {
                    alert("Correo verificado exitosamente.");
                } else {
                    alert("Token inválido o expirado.");
                }
            } catch (error) {
                console.error("Error al verificar el correo:", error);
            }
        };
        verifyEmail();
    }, [token]);

    return <div>Verificando correo...</div>;
};

export default VerifyEmail;
