import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, isSameDay } from 'date-fns'; // Para manipular fechas
import '../css/DoctorDetail.css';

const DoctorDetail = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [consultas, setConsultas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [fecha, setFecha] = useState(null); // Usamos objeto Date en lugar de string
    const [hora, setHora] = useState('');

    useEffect(() => {
        // Fetch detalles del doctor
        fetch(`http://localhost:8000/api/doctores/${id}/`)
            .then(response => response.json())
            .then(data => {
                setDoctor(data);
                // Obtener las consultas del doctor
                return fetch(`http://localhost:8000/api/consultas/${id}/`);
            })
            .then(response => response.json())
            .then(data => setConsultas(data))
            .catch(error => console.error('Error fetching doctor details or consultations:', error));
    }, [id]);

    // Función para comprobar si el día está completamente ocupado
    const isDayFullyBooked = (date) => {
        const consultasDia = consultas.filter(consulta => isSameDay(new Date(consulta.fecha), date));
        const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        return consultasDia.length >= allTimeSlots.length; // Si todas las horas están ocupadas, el día está lleno
    };

    // Deshabilitar días sin disponibilidad completa
    const filterUnavailableDays = (date) => {
        return !isDayFullyBooked(date);
    };

    // Función para comprobar si el horario está disponible en una fecha específica
    const isAvailable = (fecha, hora) => {
        return !consultas.some(consulta => consulta.fecha === fecha && consulta.hora === hora);
    };

    const handleReserva = (e) => {
        e.preventDefault();
        const formattedDate = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD para enviar al backend
    
        fetch('http://localhost:8000/api/consultas/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medico: id,
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
            setConsultas([...consultas, data]); // Actualizar la lista de consultas
            setShowModal(false); // Cerrar modal después de crear la consulta
        })
        .catch((error) => {
            alert(error.message); // Mostrar el error al usuario
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
                        <button className="consult-button">Realizar consulta médica</button>
                    </div>
                </div>
            </div>
            <div className="doctor-biography-container">
                <h3>Biografía</h3>
                <p>{doctor.biography}</p>
            </div>

            {/* Mostrar consultas existentes */}
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
                    <p>No hay consultas reservadas para este médico.</p>
                )}
            </div>

            {/* Modal para reserva de consulta */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Reservar Consulta Médica</h3>
                        <form onSubmit={handleReserva}>
                            <label htmlFor="fecha">Fecha:</label>
                            <DatePicker
                                selected={fecha}
                                onChange={(date) => setFecha(date)}
                                minDate={new Date()}
                                filterDate={filterUnavailableDays} // Deshabilitar días completos
                                required
                            />
                            <label htmlFor="hora">Hora:</label>
                            <select
                                id="hora"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                                required
                            >
                                <option value="">Selecciona una hora</option>
                                {getAvailableTimeSlots().map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                            <button type="submit" className="consult-button">Reservar</button>
                        </form>
                        <button className="close-modal" onClick={() => setShowModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDetail;
