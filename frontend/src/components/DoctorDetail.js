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
            alert('Consulta reservada correctamente');
            console.log('Consulta creada:', data);
            setConsultas([...consultas, data]);
            setShowModal(false);

            // Enviar correos usando la API
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
        const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        const formattedDate = fecha ? fecha.toISOString().split('T')[0] : '';
        return allTimeSlots.filter(slot => isAvailable(formattedDate, slot));
    };

    if (!doctor) {
        return <div>Loading...</div>;
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
                    <p>Especialidad: {doctor.specialty}</p>
                    <p>Correo: {doctor.email}</p>
                    <p>Teléfono: {doctor.phone_number}</p>
                    <p>Dirección: {doctor.address}</p>
                    <div className="doctor-buttons">
                        <button className="consult-button" onClick={() => setShowModal(true)}>Reservar consulta médica</button>
                        <button className="consult-button" onClick={() => navigate(`/chat/${id}`)}>
                        Realizar consulta médica
                        </button>
                    </div>
                </div>
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
                <label htmlFor="fecha" className="modal-label">Fecha:</label>
                <DatePicker
                    selected={fecha}
                    onChange={(date) => setFecha(date)}
                    minDate={new Date()}
                    filterDate={filterUnavailableDays}
                    required
                    inline
                    className="calendar-picker"
                />
                <label htmlFor="hora" className="modal-label">Hora:</label>
                <select
                    id="hora"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    className="input-field"
                >
                    <option value="">Selecciona una hora</option>
                    {getAvailableTimeSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                    ))}
                </select>
                <div className="modal-buttons-container">
                    <button type="submit" className="button reservar">Reservar</button>
                    <button type="button" className="button close-modal" onClick={() => setShowModal(false)}>Cerrar</button>
                </div>
            </form>
        </div>
    </div>
)}

        </div>
    );
};

export default DoctorDetail;
