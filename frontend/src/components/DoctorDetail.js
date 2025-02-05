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
        return !isDayFullyBooked(date);
    };

    const isAvailable = (fecha, hora) => {
        return !consultas.some(consulta => consulta.fecha === fecha && consulta.hora === hora);
    };

    const handleReserva = (e) => {
        e.preventDefault();
    
        // Validación de fecha y hora
        if (!fecha) {
            alert('Por favor, seleccione una fecha para la consulta.');
            return;
        }
    
        if (!hora) {
            alert('Por favor, seleccione una hora para la consulta.');
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
    
        fetch('http://localhost:8000/api/consultas/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medico: id,
                paciente: pacienteId,
                fecha: formattedDate,
                hora: hora,
                tipo_consulta: tipoConsulta,
                motivo_consulta: motivoConsulta,
                genero: genero,
                tipo_sangre: tipoSangre,
                alergias: tieneAlergias ? descripcionAlergia : null,
                embarazo: genero === "F" ? estaEmbarazada : null,
            }),
        })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.error || 'Ya existe una consulta reservada con la fecha y hora seleccionadas, por favor escoja otra fecha y hora.');
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
            alert(error.message);
            console.error('Error creando consulta:', error);
        });
    };    

    const getAvailableTimeSlots = () => {
        if (!doctor || !doctor.start_time || !doctor.end_time) return [];
    
        const startHour = parseInt(doctor.start_time.split(':')[0]);
        const endHour = parseInt(doctor.end_time.split(':')[0]);
    
        const timeSlots = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            const formattedHour = hour.toString().padStart(2, '0') + ':00';
            timeSlots.push(formattedHour);
        }
    
        return timeSlots; // Mostrar todos los horarios disponibles
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
        // Divide la hora, los minutos y los segundos
        const [hours, minutes] = time.split(':');
        // Devuelve solo las horas y los minutos
        return `${hours}:${minutes}`;
    }    

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
                            <label htmlFor="fecha" className="modal-label-calendary">Fecha:</label>
                            <DatePicker
                                selected={fecha}
                                onChange={(date) => setFecha(date)}
                                minDate={new Date()}
                                filterDate={filterUnavailableDays}
                                required
                                inline
                                className="calendar-picker"
                            />
                        </div>

                        <div>
    <label className="modal-label">Hora:</label>
    <div className="horarios-container">
        {getAvailableTimeSlots().map((slot) => {
            const isDisabled = fecha && !isAvailable(fecha.toISOString().split('T')[0], slot);
            return (
                <button
                    type="button"
                    key={slot}
                    className={`horario-button ${hora === slot ? "selected" : ""}`}
                    onClick={() => setHora(slot)}
                    disabled={isDisabled}
                >
                    {slot}
                </button>
            );
        })}
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
                            <label htmlFor="tipo_consulta" className="modal-label">Tipo de consulta:</label>
                            <select
                                id="tipo_consulta"
                                value={tipoConsulta}
                                onChange={(e) => setTipoConsulta(e.target.value)}
                                required
                                className="input-field"                            >
                                    <option value="">Selecciona el tipo de consulta</option>
                                    <option value="presencial">Presencial</option>
                                    <option value="virtual">Virtual</option>
                            </select>
                            </div>

                        <div>
                            <label htmlFor="genero" className="modal-label">Género:</label>
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

                        {/* Mostrar solo si el género es "Femenino" */}
                        {genero === "F" && (
                            <div>
                                <label htmlFor="embarazo" className="modal-label">¿Está embarazada?</label>
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
                            <label htmlFor="tipo-sangre" className="modal-label">Tipo de sangre:</label>
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
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tiene-alergias" className="modal-label-alergias">¿Tiene alergias?</label>
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
                                    <label htmlFor="descripcion-alergia" className="modal-label-alergias">Describa sus alergias:</label>
                                    <textarea
                                        id="descripcion-alergia"
                                        value={descripcionAlergia}
                                        onChange={(e) => setDescripcionAlergia(e.target.value)}
                                        className="input-field alergias-textarea"
                                        placeholder="Describa sus alergias"
                                        required
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="motivo-consulta" className="modal-label-motivo">Motivo de consulta:</label>
                            <input
                                id="motivo-consulta"
                                value={motivoConsulta}
                                onChange={(e) => setMotivoConsulta(e.target.value)}
                                required
                                className="input-field-motivo"
                                placeholder="Escriba el motivo de la consulta"
                            />
                        </div>

                        {/* Contenedor para los botones */}
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