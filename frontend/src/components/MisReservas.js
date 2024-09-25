import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MisReservas.css';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const navigate = useNavigate();
    const pacienteId = localStorage.getItem('paciente_id');
    const token = localStorage.getItem('token'); // Obtener el token

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!token) {
            // Redirigir a la página de inicio de sesión si no está autenticado
            navigate('/login');
            return;
        }

        // Obtener las consultas del paciente
        fetch(`http://localhost:8000/api/consultas/paciente/${pacienteId}/`)
            .then(response => response.json())
            .then(data => setReservas(data))
            .catch(error => console.error('Error fetching reservas:', error));
    }, [pacienteId, token, navigate]);

    const handleRealizarConsulta = (consultaId) => {
        navigate(`/chat/${consultaId}`);
    };

    const handleCancelarConsulta = (consultaId) => {
        const confirmar = window.confirm('¿Está seguro de que desea cancelar esta consulta?');

        if (confirmar) {
            fetch(`http://localhost:8000/api/consultas/${consultaId}/cancelar/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                setReservas(reservas.filter(consulta => consulta.id !== consultaId));
                alert('Consulta cancelada correctamente.');
            })
            .catch(error => console.error('Error cancelando consulta:', error));
        }
    };

    const isRealizarConsultaEnabled = (fecha, hora) => {
        const now = new Date();
        const consultaDate = new Date(`${fecha}T${hora}`);
        const timeDifference = (consultaDate - now) / 60000; // Diferencia en minutos
        return timeDifference <= 5 && timeDifference >= -60; // Habilitado si está dentro de los 5 min antes o hasta 1h después
    };

    return (
        <div className="reservas-container">
            <h2>Mis Reservas</h2>
            {reservas.length === 0 ? (
                <p>No tienes consultas reservadas.</p>
            ) : (
                <ul className="reservas-list">
                    {reservas.map(consulta => (
                        <li key={consulta.id}>
                            <p>Doctor: {consulta.medico_name}</p>
                            <p>Fecha: {consulta.fecha}</p>
                            <p>Hora: {consulta.hora}</p>
                            <button
                                onClick={() => handleRealizarConsulta(consulta.id)}
                                disabled={!isRealizarConsultaEnabled(consulta.fecha, consulta.hora)}
                            >
                                Realizar consulta
                            </button>
                            <button onClick={() => handleCancelarConsulta(consulta.id)}>
                                Cancelar consulta
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MisReservas;
