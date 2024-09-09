import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/DoctorDetail.css';

const DoctorDetail = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [consultas, setConsultas] = useState([]);
    const [showModal, setShowModal] = useState(false); // Estado para manejar la visibilidad del modal
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');

    useEffect(() => {
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

    const isAvailable = (fecha, hora) => {
        return !consultas.some(consulta => consulta.fecha === fecha && consulta.hora === hora);
    };

    const handleReserva = (e) => {
        e.preventDefault();
        if (!isAvailable(fecha, hora)) {
            alert('La fecha y hora seleccionadas ya están ocupadas.');
            return;
        }

        // Realizar la petición POST para crear la consulta
        fetch('http://localhost:8000/api/consultas/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medico: id,
                fecha: fecha,
                hora: hora,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Consulta creada:', data);
                setConsultas([...consultas, data]); // Actualizar la lista de consultas
                setShowModal(false); // Cerrar modal después de crear la consulta
            })
            .catch((error) => {
                console.error('Error creando consulta:', error);
            });
    };

    const getAvailableTimeSlots = () => {
        const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]; // Ejemplo de horarios posibles
        return allTimeSlots.filter(slot => isAvailable(fecha, slot));
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

            {/* Modal para reserva de consulta */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Reservar Consulta Médica</h3>
                        <form onSubmit={handleReserva}>
                            <label htmlFor="fecha">Fecha:</label>
                            <input
                                type="date"
                                id="fecha"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
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
