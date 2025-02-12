import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaHashtag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaFileDownload } from 'react-icons/fa';
import '../css/MisReservas.css';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [tipoConsulta, setTipoConsulta] = useState(''); // Filtro por tipo de consulta
    const [fechaConsulta, setFechaConsulta] = useState(''); // Filtro por fecha

    const navigate = useNavigate();
    const token = localStorage.getItem('token'); 
    const tipoUsuario = localStorage.getItem('tipo_usuario'); 
    const userId = localStorage.getItem('paciente_id'); 

    useEffect(() => {
        if (!token) {
            navigate('/login'); 
            return;
        }
    
        if (tipoUsuario === 'medico') {
            fetch(`http://localhost:8000/api/consultas/medico/${userId}/`)
                .then(response => response.json())
                .then(data => {
                    console.log('Datos de la API (medico):', data);
                    setReservas(data);
                })
                .catch(error => console.error('Error fetching reservas:', error));
        } else {
            fetch(`http://localhost:8000/api/consultas/paciente/${userId}/`)
                .then(response => response.json())
                .then(data => {
                    console.log('Datos de la API (paciente):', data);
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
        const timeDifference = (consultaDate - now) / 60000;
        return timeDifference <= 5 && timeDifference >= -60;
    };

    // Filtrar reservas según los filtros seleccionados
    const reservasFiltradas = reservas.filter(consulta => {
        return (
            (tipoConsulta === '' || consulta.tipo_consulta === tipoConsulta) &&
            (fechaConsulta === '' || consulta.fecha === fechaConsulta)
        );
    });

    return (
        <div className="reservas-container">
            <h2>Consultas médicas</h2>

            {/* Filtros */}
            <div className="filtros-container">
                <label>Filtrar por tipo de consulta:</label>
                <select value={tipoConsulta} onChange={(e) => setTipoConsulta(e.target.value)}>
                    <option value="">Todas</option>
                    <option value="virtual">Virtual</option>
                    <option value="presencial">Presencial</option>
                </select>

                <label>Filtrar por fecha:</label>
                <input
                    type="date"
                    value={fechaConsulta}
                    onChange={(e) => setFechaConsulta(e.target.value)}
                />
            </div>

            {reservasFiltradas.length === 0 ? (
                <p>No tienes consultas reservadas.</p>
            ) : (
                <ul className="reservas-list">
                    {reservasFiltradas.map(consulta => (
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
                            <div className="reserva-info">
                                <strong>Tipo de consulta:</strong> {consulta.tipo_consulta}
                            </div>
                            <div className="divider">
                                {consulta.archivo_pdf && (
                                    <div className="descarga-pdf">
                                        <a href={`http://localhost:8000${consulta.archivo_pdf}`} download target="_blank" rel="noopener noreferrer">
                                            <FaFileDownload className="icono-descarga-pdf" /> Ver Análisis Adjunto
                                        </a>
                                    </div>
                                )}
                            </div>
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
