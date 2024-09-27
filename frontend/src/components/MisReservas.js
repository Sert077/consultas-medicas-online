import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa'; // Importar íconos de React Icons
import { useNavigate } from 'react-router-dom';
import '../css/MisReservas.css';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const navigate = useNavigate();
    const pacienteId = localStorage.getItem('paciente_id');
    const token = localStorage.getItem('token'); // Obtener el token

    useEffect(() => {
        if (!token) {
            navigate('/login'); // Redirigir si no hay token
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
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(() => {
                setReservas(reservas.filter(consulta => consulta.id !== consultaId));
                alert('Consulta cancelada correctamente.');
            })
            .catch(error => console.error('Error cancelando consulta:', error));
        }
    };

    const isRealizarConsultaEnabled = (fecha, hora) => {
        const now = new Date();
        const consultaDate = new Date(`${fecha}T${hora}`);
        const timeDifference = (consultaDate - now) / 60000;
        return timeDifference <= 5 && timeDifference >= -60; // Habilitar 5 min antes hasta 1h después
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
                            <div className="reserva-info">
                                <FaUserMd className="icono-doctor" /> {/* Ícono de Doctor */}
                                <p><strong>Doctor:</strong> {consulta.medico_name}</p>
                            </div>
                            <div className="reserva-info">
                                <FaCalendarAlt className="icono-calendario" /> {/* Ícono de calendario */}
                                <p><strong>Fecha:</strong> {consulta.fecha}</p>
                            </div>
                            <div className="reserva-info">
                                <FaClock className="icono-reloj" /> {/* Ícono de reloj */}
                                <p><strong>Hora:</strong> {consulta.hora}</p>
                            </div>

                            <div className="divider"></div>

                            <div className="button-group">
                                <button
                                    onClick={() => handleRealizarConsulta(consulta.id)}
                                    disabled={!isRealizarConsultaEnabled(consulta.fecha, consulta.hora)}
                                >
                                    Realizar consulta
                                </button>
                                <button onClick={() => handleCancelarConsulta(consulta.id)}>
                                    Cancelar consulta
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MisReservas;
