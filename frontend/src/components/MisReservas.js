import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaHashtag, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaFileDownload } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/MisReservas.css';

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [tipoConsulta, setTipoConsulta] = useState(''); // Filtro por tipo de consulta
    const [rangoFechas, setRangoFechas] = useState([null, null]);
    const [fechaInicio, fechaFin] = rangoFechas;
    const [estadoConsulta, setEstadoConsulta] = useState('');
    const [fechaConsulta, setFechaConsulta] = useState(''); // Filtro por fecha
    const [openCalendar, setOpenCalendar] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token'); 
    const tipoUsuario = localStorage.getItem('tipo_usuario'); 
    const userId = localStorage.getItem('paciente_id'); 
    const [currentPage, setCurrentPage] = useState(1);
    const consultasPorPagina = 10;

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
        const fechaConsulta = new Date(consulta.fecha);
        return (
            (tipoConsulta === '' || consulta.tipo_consulta === tipoConsulta) &&
            (estadoConsulta === '' || consulta.estado.toLowerCase() === estadoConsulta) &&
            (!fechaInicio || !fechaFin || (fechaConsulta >= fechaInicio && fechaConsulta <= fechaFin))
        );
    });

    // Calcular la cantidad total de páginas
    const totalPaginas = Math.ceil(reservasFiltradas.length / consultasPorPagina);

    // Obtener las consultas de la página actual
    const consultasPaginadas = reservasFiltradas.slice(
        (currentPage - 1) * consultasPorPagina,
        currentPage * consultasPorPagina
    );

    // Funciones para cambiar de página
    const paginaAnterior = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const paginaSiguiente = () => {
        if (currentPage < totalPaginas) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="reservas-container">
            <h2>Consultas médicas</h2>

            {/* Filtros */}
            <div className="filtros-container">
                <label>Tipo de consulta:</label>
                <select value={tipoConsulta} onChange={(e) => setTipoConsulta(e.target.value)} className='tipo-consulta-filter'>
                    <option value="">Todas</option>
                    <option value="virtual">Virtual</option>
                    <option value="presencial">Presencial</option>
                </select>

                <label>Estado:</label>
                <select value={estadoConsulta} onChange={(e) => setEstadoConsulta(e.target.value)} className='estado-filter'>
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                </select>

                <div className="misreservas-container">
                    <div className="filtro-item">
                        <div className="filtro-label-icon">
                            <label>Fecha:</label>
                            <div className="icono-calendario-container" onClick={() => setOpenCalendar(!openCalendar)}>
                                <FaCalendarAlt className="icono-calendario-filter" />
                            </div>
                        </div>
                        {openCalendar && (
                            <DatePicker
                                selectsRange
                                startDate={fechaInicio}
                                endDate={fechaFin}
                                onChange={(update) => {
                                    setRangoFechas(update);
                                    if (update[0] && update[1]) {
                                        setOpenCalendar(false);
                                    }
                                }}
                                isClearable
                                inline
                            />
                        )}
                    </div>
                </div>
            </div>

            {fechaInicio && fechaFin && (
                <div className="fecha-rango-container">
                    <span className="fecha-rango">
                        Rango seleccionado: {fechaInicio.toLocaleDateString()} - {fechaFin.toLocaleDateString()}
                    </span>
                </div>
            )}

            {consultasPaginadas.length === 0 ? (
                <p>No tienes consultas reservadas.</p>
            ) : (
                <ul className="reservas-list">
                    {consultasPaginadas.map(consulta => (
                        <li key={consulta.id}>
                            <div className="fila-superior">
                                <div className="consulta-id">
                                    <FaHashtag className="icono-id" />
                                    <span><strong>Consulta:</strong> {consulta.id} {consulta.tipo_consulta.charAt(0).toUpperCase() + consulta.tipo_consulta.slice(1)}</span>
                                </div>
                                <div className="estado-consulta">
                                    <span className={`estado-label ${consulta.estado.toLowerCase()}`}>
                                        {consulta.estado.charAt(0).toUpperCase() + consulta.estado.slice(1)}
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
                                {consulta.archivo_pdf && (
                                    <div className="descarga-pdf">
                                        <a href={`http://localhost:8000${consulta.archivo_pdf}`} download target="_blank" rel="noopener noreferrer">
                                            <FaFileDownload className="icono-descarga-pdf" /> Ver Análisis Adjunto
                                        </a>
                                    </div>
                                )}
                                <div className="botones-derecha">
                                    <button onClick={() => handleRealizarConsulta(consulta.id)}>
                                        Realizar consulta
                                    </button>
                                    <button onClick={() => handleCancelarConsulta(consulta.id)}>
                                        Cancelar consulta
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* Controles de paginación */}
            {reservasFiltradas.length > 10 && (
                <div className="paginacion">
                    <button 
                        className="boton-paginacion" 
                        onClick={paginaAnterior} 
                        disabled={currentPage === 1}
                    >
                        <FaArrowLeft />
                    </button>
                    <span className="pagina-actual">Página {currentPage} de {totalPaginas}</span>
                    <button 
                        className="boton-paginacion" 
                        onClick={paginaSiguiente} 
                        disabled={currentPage === totalPaginas}
                    >
                        <FaArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MisReservas;