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
    const [loadingReserva, setLoadingReserva] = useState(false);
    const [tieneEnfermedadBase, setTieneEnfermedadBase] = useState(false);
    const [descripcionEnfermedad, setDescripcionEnfermedad] = useState("");
    const [tomaMedicacion, setTomaMedicacion] = useState(false);
    const [descripcionMedicacion, setDescripcionMedicacion] = useState("");
    const [tuvoCirugia, setTuvoCirugia] = useState(false);
    const [descripcionCirugia, setDescripcionCirugia] = useState("");
    const [direccionReal, setDireccionReal] = useState('Cargando dirección...');

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

    const getCoordinatesFromAddress = (address) => {
        const regex = /Lat:\s*([-+]?\d*\.\d+),\s*Lng:\s*([-+]?\d*\.\d+)/;
        const match = address?.match(regex);

        if (match) {
            return { lat: match[1], lng: match[2] };
        }
        return null;
    };

    const coordinates = doctor ? getCoordinatesFromAddress(doctor.address) : null;

    useEffect(() => {
        if (coordinates) {
            const { lat, lng } = coordinates;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(data => {
                    if (data.display_name) {
                        setDireccionReal(data.display_name); // Almacenar la dirección real
                    } else {
                        setDireccionReal("Dirección no disponible");
                    }
                })
                .catch(error => {
                    console.error("Error obteniendo la dirección:", error);
                    setDireccionReal("Error obteniendo la dirección");
                });
        }
    }, [coordinates]);

    const isAvailable = (fecha, hora) => {
        return !consultas.some(consulta => consulta.fecha === fecha && consulta.hora === hora);
    };

    const resetForm = () => {
        setFecha(null);
        setHora("");
        setTipoConsulta("");
        setMotivoConsulta("");
        setGenero("");
        setTipoSangre("");
        setTieneAlergias(false);
        setDescripcionAlergia("");
        setEstaEmbarazada(false);
        setArchivoPdf(null);
        setFechaError("");
        setHoraError("");
        setReservaError("");
        setTieneEnfermedadBase(false);
        setDescripcionEnfermedad("");
        setTomaMedicacion(false);
        setDescripcionMedicacion("");
        setTuvoCirugia(false);
        setDescripcionCirugia("");
    };    

    const handleReserva = (e) => {
        e.preventDefault();

    setFechaError('');
    setHoraError('');
    setReservaError('');
    
    if (!fecha) {
        setFechaError('Por favor, seleccione una fecha para la consulta.');
        return;
    }

    if (!hora) {
        setHoraError('Por favor, seleccione una hora para la consulta.');
        return;
    }

    setLoadingReserva(true);
    
        const formattedDate = fecha.toISOString().split('T')[0];
        const pacienteId = localStorage.getItem('paciente_id');
        const pacienteName = `${localStorage.getItem('first_name')} ${localStorage.getItem('last_name')}`;
        const pacienteEmail = localStorage.getItem('email');
        
        if (!pacienteId) {
            alert('Error: No se ha encontrado un paciente válido. Inicie sesión para reservar.');
            setLoadingReserva(false);
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
        formData.append('enfermedad_base', tieneEnfermedadBase ? descripcionEnfermedad : "no");
        formData.append('medicacion', tomaMedicacion ? descripcionMedicacion : "no");
        formData.append('cirugia', tuvoCirugia ? descripcionCirugia : "no");

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
                message_paciente: `
                    <html>
                    <head>
                        <style>
                            .email-container {
                                font-family: Arial, sans-serif;
                                max-width: 800px;
                                margin: 0 auto;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                                overflow: hidden;
                                box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
                            }
                            .email-header {
                                background: linear-gradient(135deg, #392682 55%, #28ADA8 100%);
                                color: white;
                                text-align: center;
                                padding: 20px;
                            }
                            .email-header img {
                                max-width: 120px;
                            }
                            .email-body {
                                padding: 20px;
                                color: #333;
                            }
                            .email-body h2 {
                                color: #392682;
                            }
                            .email-body p {
                                color: rgb(36, 36, 36);
                            }
                            .email-footer {
                                background: #f1f1f1;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="email-header">
                               <img src="cid:logo1" alt="MediTest Logo">
                            </div>
                            <div class="email-body">
                                <h2>¡Recordatorio de Consulta Médica!</h2>
                                <p>Estimado/a <strong>${pacienteName}</strong>,</p>
                                <p>Tiene una consulta programada con el Dr(a). ${doctor.first_name} ${doctor.last_name} el ${formattedDate} a las ${hora}.</p>
                                <p>Gracias por usar nuestro servicio.</p>
                                <p></p>
                                <p>Atentamente,<br><strong>Equipo de MediTest</strong></p>
                            </div>
                            <div class="email-footer">
                                © 2025 MediTest. Todos los derechos reservados.
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                message_medico: `
                    <html>
                    <head>
                        <style>
                            .email-container {
                                font-family: Arial, sans-serif;
                                max-width: 800px;
                                margin: 0 auto;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                                overflow: hidden;
                                box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.1);
                            }
                            .email-header {
                                background: linear-gradient(135deg, #392682 55%, #28ADA8 100%);
                                color: white;
                                text-align: center;
                                padding: 20px;
                            }
                            .email-header img {
                                max-width: 120px;
                            }
                            .email-body {
                                padding: 20px;
                                color: #333;
                            }
                            .email-body h2 {
                                color: #392682;
                            }
                            .email-body p {
                                color: rgb(36, 36, 36);
                            }
                            .email-footer {
                                background: #f1f1f1;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="email-header">
                                <img src="cid:logo1" alt="MediTest Logo">
                            </div>
                            <div class="email-body">
                                <h2>¡Recordatorio de Consulta Médica!</h2>
                                <p>Estimado/a Dr(a). <strong>${doctor.first_name} ${doctor.last_name}</strong>,</p>
                                <p>Tiene una consulta programada con ${pacienteName} el ${formattedDate} a las ${hora}.</p>
                                <p>Gracias por usar nuestro servicio.</p>
                                <p></p>
                                <p>Atentamente,<br><strong>Equipo de MediTest</strong></p>
                            </div>
                            <div class="email-footer">
                                © 2025 MediTest. Todos los derechos reservados.
                            </div>
                        </div>
                    </body>
                    </html>
                `,
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
                    html_message: emailData.message_paciente, // Asegúrate de que tu backend soporte este campo
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
                        html_message: emailData.message_medico, // Asegúrate de que tu backend soporte este campo
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
        })
        .finally(() => {
            setLoadingReserva(false);  // Desactivar el spinner al finalizar
        });
    };
    
    const closeModal = () => {
        resetForm();
        setShowConfirmationModal(false);
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
      {/* Cabecera con información principal del médico */}
      <div className="doctor-header">
      <div className="doctor-header-bg">
            <h3 className="doctor-header-title">
                <i className="fas fa-user-md"></i> Información del Médico
            </h3>
            </div>
        <div className="doctor-info-container">
          <div className="doctor-image-container">
            <img
              src={doctor.profile_picture || "/placeholder.svg"}
              alt={`${doctor.first_name} ${doctor.last_name}`}
              className="doctor-image"
            />
          </div>
          <div className="doctor-details">
            <h2>
              Dr(a). {doctor.first_name} {doctor.last_name}
            </h2>

            <div className="doctor-info-grid">
              <div className="doctor-info-item">
                <i className="fas fa-stethoscope"></i>
                <div>
                  <span className="info-label">Especialidad</span>
                  <span className="info-value">{doctor.specialty}</span>
                </div>
              </div>

              <div className="doctor-info-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <span className="info-label">Correo</span>
                  <span className="info-value">{doctor.email}</span>
                </div>
              </div>

              <div className="doctor-info-item">
                <i className="fas fa-phone"></i>
                <div>
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{doctor.phone_number}</span>
                </div>
              </div>

              <div className="doctor-info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <span className="info-label">Dirección</span>
                  <span className="info-value">{direccionReal}</span>
                </div>
              </div>

              <div className="doctor-info-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <span className="info-label">Días de Atención</span>
                  <span className="info-value">{formatDays(doctor.days)}</span>
                </div>
              </div>

              <div className="doctor-info-item">
                <i className="fas fa-clock"></i>
                <div>
                  <span className="info-label">Horario de Atención</span>
                  <span className="info-value">
                    {formatTime(doctor.start_time)} a {formatTime(doctor.end_time)} Hrs.
                  </span>
                </div>
              </div>
            </div>

            <div className="doctor-buttons">
              <button className="consult-button" onClick={() => setShowModal(true)}>
                <i className="fas fa-calendar-plus"></i> Reservar consulta médica
              </button>
              <button className="consult-button" onClick={() => navigate(`/misreservas`)}>
                <i className="fas fa-comments"></i> Realizar consulta médica
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa - ocupa todo el ancho */}
      <div className="info-card map-container">
          <div className="info-card-header-mapa">
            <h3>
              <i className="fas fa-map-marked-alt"></i> Ubicación del Consultorio
            </h3>
          </div>
          <div className="info-card-body">
            {coordinates ? (
              <iframe
                title="map"
                src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&output=embed`}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            ) : (
              <p className="no-consultas">Ubicación no disponible</p>
            )}
          </div>
        </div>

      {/* Contenido principal en dos columnas */}
      <div className="doctor-content">
        {/* Biografía */}
        <div className="info-card doctor-biography-container">
          <div className="info-card-header">
            <h3>
              <i className="fas fa-user"></i> Biografía
            </h3>
          </div>
          <div className="info-card-body">
            <p>{doctor.biography}</p>
          </div>
        </div>

        {/* Consultas */}
        <div className="info-card consultas-container">
          <div className="info-card-header">
            <h3>
              <i className="fas fa-calendar-check"></i> Consultas Reservadas
            </h3>
          </div>
          <div className="info-card-body">
            {consultas.length > 0 ? (
              <ul className="consultas-list">
                {consultas.map((consulta) => (
                  <li key={consulta.id} className="consulta-item">
                    <div className="consulta-icon">
                      <i className="fas fa-calendar-day"></i>
                    </div>
                    <div className="consulta-info">
                      <div className="consulta-date">{consulta.fecha}</div>
                      <div className="consulta-time">a las {consulta.hora}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-consultas">No hay consultas reservadas.</p>
            )}
          </div>
        </div>
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
                        <div className="seleccionado-info">
                            <div className="seleccion-texto">
                            <p className="hora-seleccionada">
                                <strong>📅 Hora seleccionada</strong>
                            </p>
                            <p className="hora-detalle">{hora}, {fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button
                            type="button"
                            className="button cancelar-seleccionado"
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
    <label htmlFor="tiene-enfermedad" className="modal-label-alergias">
        ¿Tiene una enfermedad de base?<span style={{ color: 'red', marginLeft: '3px' }}>*</span>
    </label>
    <div className="input-field alergias-input-field">
        <label>
            <input
                type="radio"
                name="tiene-enfermedad"
                value="Sí"
                checked={tieneEnfermedadBase === true}
                onChange={() => setTieneEnfermedadBase(true)}
                className="radio-alergias"
            />
            Sí
        </label>
        <label>
            <input
                type="radio"
                name="tiene-enfermedad"
                value="No"
                checked={tieneEnfermedadBase === false}
                onChange={() => {
                    setTieneEnfermedadBase(false);
                    setDescripcionEnfermedad('');
                }}
                className="radio-alergias"
            />
            No
        </label>
    </div>
    {tieneEnfermedadBase && (
        <div>
            <label htmlFor="descripcion-enfermedad" className="modal-label-alergias">
                Describa su enfermedad de base:<span style={{ color: 'red' }}>*</span>
            </label>
            <div className="textarea-container">
                <textarea
                    id="descripcion-enfermedad"
                    value={descripcionEnfermedad}
                    onChange={(e) => setDescripcionEnfermedad(e.target.value)}
                    className="input-field alergias-textarea"
                    placeholder="Describa su enfermedad"
                    required
                ></textarea>
                <p className="char-count">{descripcionEnfermedad.length}/100</p>
            </div>
        </div>
    )}
</div>

<div>
    <label htmlFor="toma-medicacion" className="modal-label-alergias">
        ¿Actualmente toma medicamentos?<span style={{ color: 'red', marginLeft: '3px' }}>*</span>
    </label>
    <div className="input-field alergias-input-field">
        <label>
            <input
                type="radio"
                name="toma-medicacion"
                value="Sí"
                checked={tomaMedicacion === true}
                onChange={() => setTomaMedicacion(true)}
                className="radio-alergias"
            />
            Sí
        </label>
        <label>
            <input
                type="radio"
                name="toma-medicacion"
                value="No"
                checked={tomaMedicacion === false}
                onChange={() => {
                    setTomaMedicacion(false);
                    setDescripcionMedicacion('');
                }}
                className="radio-alergias"
            />
            No
        </label>
    </div>
    {tomaMedicacion && (
        <div>
            <label htmlFor="descripcion-medicacion" className="modal-label-alergias">
                Describa la medicación que está tomando:<span style={{ color: 'red' }}>*</span>
            </label>
            <div className="textarea-container">
                <textarea
                    id="descripcion-medicacion"
                    value={descripcionMedicacion}
                    onChange={(e) => setDescripcionMedicacion(e.target.value)}
                    className="input-field alergias-textarea"
                    placeholder="Describa la medicación"
                    required
                ></textarea>
                <p className="char-count">{descripcionMedicacion.length}/100</p>
            </div>
        </div>
    )}
</div>
<div>
    <label htmlFor="tuvo-cirugia" className="modal-label-alergias">
        ¿Tuvo alguna cirugía?<span style={{ color: 'red', marginLeft: '3px' }}>*</span>
    </label>
    <div className="input-field alergias-input-field">
        <label>
            <input
                type="radio"
                name="tuvo-cirugia"
                value="Sí"
                checked={tuvoCirugia === true}
                onChange={() => setTuvoCirugia(true)}
                className="radio-alergias"
            />
            Sí
        </label>
        <label>
            <input
                type="radio"
                name="tuvo-cirugia"
                value="No"
                checked={tuvoCirugia === false}
                onChange={() => {
                    setTuvoCirugia(false);
                    setDescripcionCirugia('');
                }}
                className="radio-alergias"
            />
            No
        </label>
    </div>
    {tuvoCirugia && (
        <div>
            <label htmlFor="descripcion-cirugia" className="modal-label-alergias">
                Describa la cirugía que tuvo:<span style={{ color: 'red' }}>*</span>
            </label>
            <div className="textarea-container">
                <textarea
                    id="descripcion-cirugia"
                    value={descripcionCirugia}
                    onChange={(e) => setDescripcionCirugia(e.target.value)}
                    className="input-field alergias-textarea"
                    placeholder="Describa la cirugía"
                    required
                ></textarea>
                <p className="char-count">{descripcionCirugia.length}/100</p>
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
                                    placeholder="Escriba el motivo o dolencias de su consulta"
                                />
                                <p className="char-count">{motivoConsulta.length}/150</p>
                            </div>
                        </div>
                        {reservaError && <p className="error-message-consulta">{reservaError}</p>}

                        <div className="modal-buttons-container-outside">
                        <button type="submit" className="button reservar" disabled={loadingReserva}>
                            {loadingReserva ? (
                                <div className="spinner-reserva"></div>
                            ) : (
                                "Reservar"
                            )}
                        </button>
                            <button type="button" className="button close-modal" onClick={() => setShowModal(false)}>Cerrar</button>
                        </div>
                                </form>
                            </div>
                        </div>
                    )}
                    {/* Modal de mensaje de exito de reserva*/}
                    {showConfirmationModal && (
                        <div className="modal-overlay-confirmation" onClick={() => setShowConfirmationModal(false)}>
                        <div className="modal-content-confirmation" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-header-confirmation">
                            <div className="checkmark-circle">
                              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                              </svg>
                            </div>
                          </div>
                          <div className="modal-body-confirmation">
                            <h3>¡Consulta Reservada Correctamente!</h3>
                            <p>
                              Tu consulta con el Dr(a): {doctor.first_name} {doctor.last_name} ha sido reservada para el{" "}
                              {fecha?.toLocaleDateString()} a las {hora} Hrs.
                            </p>
                            <button className="modal-button" onClick={closeModal}>
                              Aceptar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
    );
};

export default DoctorDetail;