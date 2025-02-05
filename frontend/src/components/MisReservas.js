import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaHashtag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaFileDownload } from 'react-icons/fa';
import '../css/MisReservas.css';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token'); // Obtener el token
    const tipoUsuario = localStorage.getItem('tipo_usuario'); // Obtener el tipo de usuario
    const userId = localStorage.getItem('paciente_id'); // Obtener el id del usuario logueado

    useEffect(() => {
        if (!token) {
            navigate('/login'); // Redirigir si no hay token
            return;
        }
    
        // Hacer la llamada API dependiendo del tipo de usuario
        if (tipoUsuario === 'medico') {
            fetch(`http://localhost:8000/api/consultas/medico/${localStorage.getItem('paciente_id')}/`)
                .then(response => response.json())
                .then(data => {
                    console.log('Datos de la API (medico):', data); // Agregar console.log aquí
                    setReservas(data);
                })
                .catch(error => console.error('Error fetching reservas:', error));
        } else {
            // Obtener las consultas del paciente
            fetch(`http://localhost:8000/api/consultas/paciente/${userId}/`)
                .then(response => response.json())
                .then(data => {
                    console.log('Datos de la API (paciente):', data); // Agregar console.log aquí
                    setReservas(data);
                })
                .catch(error => console.error('Error fetching reservas:', error));
        }
    }, [token, navigate, tipoUsuario, userId]);
    

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
        const timeDifference = (consultaDate - now) / 60000; // Diferencia en minutos
        return timeDifference <= 5 && timeDifference >= -60; // Habilitar 5 min antes hasta 1h después
    };

    return (
        <div className="reservas-container">
            <h2>Consultas médicas</h2>
            {reservas.length === 0 ? (
                <p>No tienes consultas reservadas.</p>
            ) : (
                <ul className="reservas-list">
                    {reservas.map(consulta => (
                        <li key={consulta.id}>
                            <div className="fila-superior">
                            <div className="consulta-id">
                                <FaHashtag className="icono-id" />
                                <span><strong>Consulta:</strong> {consulta.id}</span>
                            </div>
                            <div className="estado-consulta">
                                <span className={`estado-label ${consulta.estado.toLowerCase()}`}>
                                    {consulta.estado}
                                </span>
                            </div>
                            {consulta.estado.toLowerCase() === 'realizada' && consulta.doc_receta && (
                            <div className="descarga-receta">
                                <a href={`http://localhost:8000${consulta.doc_receta}`} download target="_blank" rel="noopener noreferrer">
                                    <FaFileDownload className="icono-descarga" /> Ver receta
                                </a>
                            </div>
                        )}


                        </div>
                            <div className="reserva-info">
                                <FaUserMd className="icono-doctor" />
                                <p><strong>{tipoUsuario === 'medico' ? 'Paciente:' : 'Doctor:'}</strong> {tipoUsuario === 'medico' ? consulta.paciente_name : consulta.medico_name}</p>
                            </div>
                            <div className="reserva-info">
                                <FaCalendarAlt className="icono-calendario" />
                                <p><strong>Fecha:</strong> {consulta.fecha}</p>
                            </div>
                            <div className="reserva-info">
                                <FaClock className="icono-reloj" />
                                <p><strong>Hora:</strong> {consulta.hora}</p>
                            </div>

                            <div className="divider"></div>

                            <div className="button-group">
                                <button
                                    onClick={() => handleRealizarConsulta(consulta.id)}
                                    
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
