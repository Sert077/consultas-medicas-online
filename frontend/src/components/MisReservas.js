import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MisReservas.css';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const navigate = useNavigate();
    const pacienteId = localStorage.getItem('paciente_id');

    useEffect(() => {
        // Obtener las consultas del paciente
        fetch(`http://localhost:8000/api/consultas/paciente/${pacienteId}/`)
            .then(response => response.json())
            .then(data => setReservas(data))
            .catch(error => console.error('Error fetching reservas:', error));
    }, [pacienteId]);

    const handleRealizarConsulta = (consultaId) => {
        // Redirigir al chat de la consulta
        navigate(`/chat/${consultaId}`);
    };

    const handleCancelarConsulta = (consultaId) => {
        // Mostrar mensaje de confirmación
        const confirmar = window.confirm('¿Está seguro de que desea cancelar esta consulta?');

        if (confirmar) {
            // Enviar la solicitud para cancelar la consulta si el usuario confirma
            fetch(`http://localhost:8000/api/consultas/${consultaId}/cancelar/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                // Actualizar la lista de reservas
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
                            <p>Doctor: {consulta.medico_name}</p>  {/* Mostrar el nombre del médico */}
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
