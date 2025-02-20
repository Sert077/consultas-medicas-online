import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, isSameDay } from 'date-fns';
import '../css/DoctorDetail.css';

const DoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [consultas, setConsultas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [fecha, setFecha] = useState(null);
    const [hora, setHora] = useState('');
    const [genero, setGenero] = useState(''); 
    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [tipoSangre, setTipoSangre] = useState('');
    const [tieneAlergias, setTieneAlergias] = useState(false);
    const [descripcionAlergia, setDescripcionAlergia] = useState('');
    const [tipoConsulta, setTipoConsulta] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false); 
    const [estaEmbarazada, setEstaEmbarazada] = useState(false);
    const [fechaError, setFechaError] = useState('');
    const [horaError, setHoraError] = useState('');
    const [reservaError, setReservaError] = useState('');
    const [archivoPdf, setArchivoPdf] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/doctores/${id}/`)
            .then(response => response.json())
            .then(data => {
                setDoctor(data);
                return fetch(`http://localhost:8000/api/consultas/${id}/`);
            })
            .then(response => response.json())
            .then(data => setConsultas(data))
            .catch(error => console.error('Error fetching doctor details or consultations:', error));
    }, [id]);

    const isDayFullyBooked = (date) => {
        const consultasDia = consultas.filter(consulta => isSameDay(new Date(consulta.fecha), date));
        const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        return consultasDia.length >= allTimeSlots.length;
    };

    const filterUnavailableDays = (date) => {
        const availableDays = getDoctorAvailableDays();
        return availableDays.includes(date.getDay()) && !isDayFullyBooked(date);
    };

    const isAvailable = (fecha, hora) => {
        return !consultas.some(consulta => consulta.fecha === fecha && consulta.hora === hora);
    };

    const handleReserva = (e) => {
        e.preventDefault();

    setFechaError('');
    setHoraError('');

    if (!fecha) {
        setFechaError('Por favor, seleccione una fecha para la consulta.');
        return;
    }

    if (!hora) {
        setHoraError('Por favor, seleccione una hora para la consulta.');
        return;
    }
        const formattedDate = fecha.toISOString().split('T')[0];
        const pacienteId = localStorage.getItem('paciente_id');
        const pacienteName = `${localStorage.getItem('first_name')} ${localStorage.getItem('last_name')}`;
        const pacienteEmail = localStorage.getItem('email');
        
        if (!pacienteId) {
            alert('Error: No se ha encontrado un paciente válido. Inicie sesión para reservar.');
            return;
        }
    
        const formData = new FormData();
        formData.append('medico', id);
        formData.append('paciente', pacienteId);
        formData.append('fecha', formattedDate);
        formData.append('hora', hora);
        formData.append('tipo_consulta', tipoConsulta);
        formData.append('motivo_consulta', motivoConsulta);
        formData.append('genero', genero);
        formData.append('tipo_sangre', tipoSangre);
        formData.append('alergias', tieneAlergias ? descripcionAlergia : "no");
        formData.append('embarazo', genero === "F" ? estaEmbarazada : null);

        if (archivoPdf) {
            formData.append('archivo_pdf', archivoPdf);
        }

    fetch('http://localhost:8000/api/consultas/create/', {
        method: 'POST',
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.error || 'Ya existe una consulta reservada con la fecha y hora seleccionadas, por favor escoja otro horario.');
                });
            }
            return response.json();
        })
        .then((data) => {
            setShowConfirmationModal(true);
            console.log('Consulta creada:', data);
            setConsultas([...consultas, data]);
            setShowModal(false);
    
            // Enviar correos
            const emailData = {
                subject: 'Recordatorio de Consulta Médica',
                message_paciente: `Estimado(a) ${pacienteName},\n\n` +
                                  `Tiene una consulta programada con el Dr(a). ${doctor.first_name} ${doctor.last_name}` +
                                  ` el ${formattedDate} a las ${hora}.\n\nGracias por usar nuestro servicio.`,
                message_medico: `Estimado(a) Dr(a). ${doctor.first_name} ${doctor.last_name},\n\n` +
                                `Tiene una consulta programada con ${pacienteName}` +
                                ` el ${formattedDate} a las ${hora}.\n\nGracias por usar nuestro servicio.`,
                recipient_list_paciente: [pacienteEmail],
                recipient_list_medico: [doctor.email],
            };
    
            fetch('http://localhost:8000/api/send-email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: emailData.subject,
                    message: emailData.message_paciente,
                    recipient_list: emailData.recipient_list_paciente,
                }),
            })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.error || 'Error al enviar correo al paciente.');
                    });
                }
                console.log('Correo enviado al paciente');
                return fetch('http://localhost:8000/api/send-email/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        subject: emailData.subject,
                        message: emailData.message_medico,
                        recipient_list: emailData.recipient_list_medico,
                    }),
                });
            })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.error || 'Error al enviar correo al médico.');
                    });
                }
                console.log('Correo enviado al médico');
            })
            .catch((error) => {
                alert(error.message);
                console.error('Error enviando correos:', error);
            });
        })
        .catch((error) => {
            setReservaError(error.message); 
            console.error('Error creando consulta:', error);
        });
    };    

    const getAvailableTimeSlots = () => {
        if (!doctor || !doctor.start_time || !doctor.end_time) return [];
    
        const startHour = parseInt(doctor.start_time.split(':')[0]);
        const endHour = parseInt(doctor.end_time.split(':')[0]);
    
        const allTimeSlots = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            const formattedHour = hour.toString().padStart(2, '0') + ':00';
            allTimeSlots.push(formattedHour);
        }
    
        if (!fecha) {
            return allTimeSlots.map(hora => ({ hora, disponible: false }));
        }
    
        const fechaSeleccionada = fecha.toISOString().split('T')[0];
        const horariosOcupados = consultas
            .filter(consulta => consulta.fecha === fechaSeleccionada)
            .map(consulta => consulta.hora.substring(0, 5));
    
        return allTimeSlots.map(hora => ({
            hora,
            disponible: !horariosOcupados.includes(hora),
        }));
    };    

    if (!doctor) {
        return <div>Loading...</div>;
    }
    function formatDays(days) {
        const dayMapping = {
            L: "Lunes",
            M: "Martes",
            X: "Miércoles",
            J: "Jueves",
            V: "Viernes",
            S: "Sábado",
            D: "Domingo",
        };
    
        // Divide el string en un array de días
        const dayArray = days.split(',');

        // Si contiene todos los días
        if (days === "L,M,X,J,V,S,D") {
            return "Lunes a Domingo";
        }
        // Si es de lunes a viernes
        if (days === "L,M,X,J,V") {
            return "Lunes a Viernes";
        }
    
        const formattedDays = dayArray.map(day => dayMapping[day] || day);
        return formattedDays.length > 1
            ? `${formattedDays.slice(0, -1).join(', ')} y ${formattedDays.slice(-1)}`
            : formattedDays[0];
    }
    
    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    }  

    const getDoctorAvailableDays = () => {
        if (!doctor || !doctor.days) return [];
    
        const dayMapping = {
            "L": 1, "M": 2, "X": 3, "J": 4, "V": 5, "S": 6, "D": 0
        };
    
        return doctor.days.split(',').map(day => dayMapping[day]);
    };
    
    const handleFileChange = (e) => {
        setArchivoPdf(e.target.files[0]);
    };

    const handleDescripcionAlergiaChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z0-9\s.,áéíóúÁÉÍÓÚñÑ]*$/; // Permitir solo letras, números, espacios, comas y puntos
    
        if (value.length <= 100 && regex.test(value)) {
            setDescripcionAlergia(value);
        }
    };
    
    const handleMotivoConsultaChange = (e) => {
        const value = e.target.value;
        const regex = /^[a-zA-Z0-9\s.,áéíóúÁÉÍÓÚñÑ]*$/;
    
        if (value.length <= 150 && regex.test(value)) {
            setMotivoConsulta(value);
        }
    };    
      
    return (
        <div className="doctor-detail-container">
            <div className="doctor-info-container">
        <img
            src={doctor.profile_picture}
            alt={`${doctor.first_name} ${doctor.last_name}`}
            className="doctor-image"
        />
        <div className="doctor-details">
            <h2>Dr(a): {doctor.first_name} {doctor.last_name}</h2>
            <p><i className="fas fa-stethoscope"></i> Especialidad: {doctor.specialty}</p>
            <p><i className="fas fa-envelope"></i> Correo: {doctor.email}</p>
            <p><i className="fas fa-phone"></i> Teléfono: {doctor.phone_number}</p>
            <p><i className="fas fa-map-marker-alt"></i> Dirección: {doctor.address}</p>
            <p><i className="fas fa-calendar-alt"></i> Días de Atención: {formatDays(doctor.days)}</p>
            <p><i className="fas fa-clock"></i> Horario de Atención: {formatTime(doctor.start_time)} a {formatTime(doctor.end_time)} Hrs.</p>
            <div className="doctor-buttons">
                <button className="consult-button" onClick={() => setShowModal(true)}>Reservar consulta médica</button>
                <button className="consult-button" onClick={() => navigate(`/misreservas`)}>
                    Realizar consulta médica
                        </button>
                    </div>
                </div>
            </div>

            <div className="map-container">
                    <h3>Ubicación del Consultorio</h3>
                    <iframe
                        title="map"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(doctor.address)}&output=embed`}
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
                
            <div className="doctor-biography-container">
                <h3>Biografía</h3>
                <p>{doctor.biography}</p>
            </div>

            <div className="consultas-container">
                <h3>Consultas Reservadas</h3>
                {consultas.length > 0 ? (
                    <ul>
                        {consultas.map((consulta) => (
                            <li key={consulta.id}>
                                {consulta.fecha} a las {consulta.hora}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay consultas reservadas.</p>
                )}
            </div>

           {/* Modal para reserva de consulta */}
           {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>Reservar Consulta Médica</h3>
                    <form onSubmit={handleReserva} className="modal-form">
                    <div className="calendar-picker-container">
                        <label htmlFor="fecha" className="modal-label-calendary">Fecha:<span style={{ color: 'red' }}>*</span>
                        </label>
                        <DatePicker
                            selected={fecha}
                            onChange={(date) => {
                                setFecha(date);
                                setFechaError(''); // Limpiar el error al seleccionar una fecha
                            }}
                            minDate={new Date()}
                            filterDate={filterUnavailableDays}
                            required
                            inline
                            className="calendar-picker"
                        />
                        {fechaError && <div className="error-message">{fechaError}</div>}
                    </div>

                    <div>
                        <label className="modal-label">Hora:<span style={{ color: 'red' }}>*</span>
                        </label>
                        <div className="horarios-container">
                            {!fecha && <p className="seleccione-fecha-mensaje">Seleccione una fecha para ver los horarios disponibles.</p>}

                            {fecha && (
                                <div className="horarios">
                                    {getAvailableTimeSlots().map(({ hora: horaDisponible, disponible }) => (
                                        <button
                                            key={horaDisponible}
                                            type="button"  // Asegura que el botón no envíe el formulario
                                            className={`horario-button ${disponible ? "disponible" : "disabled"} ${hora === horaDisponible ? "selected" : ""}`}
                                            onClick={() => {
                                                if (disponible) {
                                                    setHora(horaDisponible);
                                                    setHoraError(""); // Limpiar error si se selecciona un horario válido
                                                }
                                            }}
                                            disabled={!disponible}
                                        >
                                            {horaDisponible}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {horaError && <p className="error-message">{horaError}</p>}
                        </div>
                    </div>

                        {/* Mostrar la fecha y hora seleccionada */}
                        {fecha && hora && (
                        <div className="seleccion-info">
                            <div className="seleccion-texto">
                            <p className="hora-seleccionada">
                                <strong>📅 Hora seleccionada</strong>
                            </p>
                            <p className="hora-detalle">{hora}, {fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button
                            type="button"
                            className="button cancelar-seleccion"
                            onClick={() => { setFecha(null); setHora(""); }}
                            required
                            >
                            Cancelar selección
                            </button>
                        </div>
                        )}

                        <div>
                            <label htmlFor="tipo_consulta" className="modal-label">Tipo de consulta:<span style={{ color: 'red' }}>*</span>
                            </label>
                            <select
                                id="tipo_consulta"
                                value={tipoConsulta}
                                onChange={(e) => setTipoConsulta(e.target.value)}
                                required
                                className="input-field" >
                                    <option value="">Selecciona el tipo de consulta</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="virtual">Virtual</option>
                            </select>
                        </div>

                        <div className="file-upload-container">
                            <label htmlFor="archivoPdf" className="modal-label">Adjuntar Análisis (PDF):</label>
                            <div className="custom-file-upload">
                                <label htmlFor="archivoPdf" className="upload-button">Seleccionar archivo</label>
                                <span className="file-name">{archivoPdf ? archivoPdf.name : "Ningún archivo seleccionado"}</span>
                            </div>
                            <input
                                type="file"
                                id="archivoPdf"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden-file-input"
                            />
                        </div>

                        <div>
                        <label htmlFor="genero" className="modal-label">
                            Género:<span style={{ color: 'red', marginLeft: '3px' }}>*</span>
                        </label>
                            <select
                                id="genero"
                                value={genero}
                                onChange={(e) => setGenero(e.target.value)}
                                required
                                className="input-field"
                            >
                                <option value="">Selecciona su género</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        {genero === "F" && (
                            <div>
                                <label htmlFor="embarazo" className="modal-label">¿Está embarazada?<span style={{ color: 'red' }}>*</span></label>
                                <select
                                    id="embarazo"
                                    value={estaEmbarazada ? "Sí" : "No"}
                                    onChange={(e) => setEstaEmbarazada(e.target.value === "Sí")}
                                    className="input-field"
                                >
                                    <option value="No">No</option>
                                    <option value="Sí">Sí</option>
                                </select>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="tipo-sangre" className="modal-label">Tipo de sangre:<span style={{ color: 'red' }}>*</span></label>
                            <select
                                id="tipo-sangre"
                                value={tipoSangre}
                                onChange={(e) => setTipoSangre(e.target.value)}
                                required
                                className="input-field"
                            >
                                <option value="">Seleccione su tipo de sangre</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tiene-alergias" className="modal-label-alergias">¿Tiene alergias?<span style={{ color: 'red', marginLeft: '3px' }}>*</span></label>
                            <div className="input-field alergias-input-field">
                                <label>
                                    <input
                                        type="radio"
                                        name="tiene-alergias"
                                        value="Sí"
                                        checked={tieneAlergias === true}
                                        onChange={() => setTieneAlergias(true)}
                                        className="radio-alergias"
                                    />
                                    Sí
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="tiene-alergias"
                                        value="No"
                                        checked={tieneAlergias === false}
                                        onChange={() => {
                                            setTieneAlergias(false);
                                            setDescripcionAlergia('');
                                        }}
                                        className="radio-alergias"
                                    />
                                    No
                                </label>
                            </div>

                            {tieneAlergias && (
                                <div>
                                    <label htmlFor="descripcion-alergia" className="modal-label-alergias">
                                        Describa sus alergias:<span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <div className="textarea-container">
                                        <textarea
                                            id="descripcion-alergia"
                                            value={descripcionAlergia}
                                            onChange={handleDescripcionAlergiaChange}
                                            className="input-field alergias-textarea"
                                            placeholder="Describa sus alergias"
                                            required
                                        ></textarea>
                                        <p className="char-count">{descripcionAlergia.length}/100</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="motivo-consulta" className="modal-label-motivo">
                                Motivo de consulta:<span style={{ color: 'red' }}>*</span>
                            </label>
                            <div className="input-container-motivo">
                                <input
                                    id="motivo-consulta"
                                    value={motivoConsulta}
                                    onChange={handleMotivoConsultaChange}
                                    required
                                    className="input-field-motivo"
                                    placeholder="Escriba el motivo de su consulta"
                                />
                                <p className="char-count">{motivoConsulta.length}/150</p>
                            </div>
                        </div>
                        {reservaError && <p className="error-message-consulta">{reservaError}</p>}

                        <div className="modal-buttons-container-outside">
                            <button type="submit" className="button reservar">Reservar</button>
                            <button type="button" className="button close-modal" onClick={() => setShowModal(false)}>Cerrar</button>
                        </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal de confirmación */}
                    {showConfirmationModal && (
                        <div className="modal-overlay" onClick={() => setShowConfirmationModal(false)}>
                            <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
                                <h3>¡Consulta Reservada Correctamente!</h3>
                                <p>Tu consulta con el Dr(a): {doctor.first_name} {doctor.last_name} ha sido reservada para el {fecha?.toLocaleDateString()} a las {hora}.</p>
                                <button className="button confirmation-modal-content" onClick={() => setShowConfirmationModal(false)}>Cerrar</button>
                            </div>
                        </div>
                    )}
                </div>
    );
};

export default DoctorDetail;