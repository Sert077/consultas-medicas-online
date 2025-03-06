import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isSameDay } from 'date-fns';
import '../css/ReprogramarConsulta.css'; // Asegúrate de tener el CSS adecuado

const ReprogramarConsulta = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [consultas, setConsultas] = useState([]);
    const [fecha, setFecha] = useState(null);
    const [hora, setHora] = useState('');
    const [error, setError] = useState('');
    const [fechaError, setFechaError] = useState('');
    const [horaError, setHoraError] = useState('');
    const [reservaError, setReservaError] = useState('');

    useEffect(() => {
        fetch(`http://localhost:8000/api/consultas/reprogramar/${token}/`)
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    setError("Este enlace no es válido o la consulta ya fue reprogramada.");
                } else {
                    setDoctor(data.doctor);
                    fetch(`http://localhost:8000/api/consultas/${data.doctor.doctor_id}/`)
                        .then(response => response.json())
                        .then(data => setConsultas(data))
                        .catch(error => console.error('Error fetching consultations:', error));
                }
            })
            .catch(error => console.error('Error al cargar consulta:', error));
    }, [token]);

    const isDayFullyBooked = (date) => {
        const consultasDia = consultas.filter(consulta => isSameDay(new Date(consulta.fecha), date));
        const allTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        return consultasDia.length >= allTimeSlots.length;
    };

    const filterUnavailableDays = (date) => {
        const availableDays = getDoctorAvailableDays();
        return availableDays.includes(date.getDay()) && !isDayFullyBooked(date);
    };

    const handleReprogramar = () => {
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

        fetch(`http://localhost:8000/api/consultas/reprogramar/${token}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha: fecha.toISOString().split("T")[0], hora }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Consulta reprogramada con éxito.");
                    navigate("/");
                } else {
                    setError(data.error);
                }
            })
            .catch(error => console.error("Error reprogramando la consulta:", error));
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
        return <div>Cargando...</div>;
    }

    function formatDays(days) {
        const dayMapping = { L: "Lunes", M: "Martes", X: "Miércoles", J: "Jueves", V: "Viernes", S: "Sábado", D: "Domingo" };
        const dayArray = days.split(',');
        if (days === "L,M,X,J,V,S,D") return "Lunes a Domingo";
        if (days === "L,M,X,J,V") return "Lunes a Viernes";
        const formattedDays = dayArray.map(day => dayMapping[day] || day);
        return formattedDays.length > 1 ? `${formattedDays.slice(0, -1).join(', ')} y ${formattedDays.slice(-1)}` : formattedDays[0];
    }

    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    }
    
    const getDoctorAvailableDays = () => {
        if (!doctor || !doctor.days) return [];
        const dayMapping = { "L": 1, "M": 2, "X": 3, "J": 4, "V": 5, "S": 6, "D": 0 };
        return doctor.days.split(',').map(day => dayMapping[day]);
    };

    return (
        <div className="doctor-detail-container">
            <h3>Reprogramar Consulta</h3>
            <div className="doctor-info-container">
                <img src={`http://localhost:8000${doctor.profile_picture}`} alt={`${doctor.first_name} ${doctor.last_name}`} className="doctor-image" />
                <div className="doctor-details">
                    <h2>Dr(a): {doctor.first_name} {doctor.last_name}</h2>
                    <p><i className="fas fa-stethoscope"></i> Especialidad: {doctor.specialty}</p>
                    <p><i className="fas fa-envelope"></i> Correo: {doctor.email}</p>
                    <p><i className="fas fa-phone"></i> Teléfono: {doctor.phone_number}</p>
                    <p><i className="fas fa-map-marker-alt"></i> Dirección: {doctor.address}</p>
                    <p><i className="fas fa-calendar-alt"></i> Días de Atención: {formatDays(doctor.days)}</p>
                    <p><i className="fas fa-clock"></i> Horario de Atención: {formatTime(doctor.start_time)} a {formatTime(doctor.end_time)} Hrs.</p>
                </div>
            </div>
    
            {/* Nueva estructura para mantener los elementos en columna */}
            <div className="reprogramar-container">
            <div className="calendar-horarios-wrapper">
    <div className="calendar-picker-container">
        <label htmlFor="fecha" className="modal-label-calendary">
            Fecha:<span style={{ color: 'red' }}>*</span>
        </label>
        <DatePicker
            selected={fecha}
            onChange={(date) => {
                setFecha(date);
                setFechaError('');
            }}
            minDate={new Date()}
            filterDate={filterUnavailableDays}
            required
            inline
            className="calendar-picker"
        />
        {fechaError && <div className="error-message">{fechaError}</div>}
    </div>

    {/* Agregar una envoltura alrededor de la selección de horario */}
    <div className="horarios-container">
        <label className="modal-label-horarios">
            Hora:<span style={{ color: 'red' }}>*</span>
        </label>
        {!fecha && <p className="seleccione-fecha-mensaje">Seleccione una fecha para ver los horarios disponibles.</p>}
        {fecha && (
            <div className="horarios">
                {getAvailableTimeSlots().map(({ hora: horaDisponible, disponible }) => (
                    <button
                        key={horaDisponible}
                        type="button"
                        className={`horario-button ${disponible ? "disponible" : "disabled"} ${hora === horaDisponible ? "selected" : ""}`}
                        onClick={() => {
                            if (disponible) {
                                setHora(horaDisponible);
                                setHoraError("");
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

    
                {/* Colocar selección de horario y botón debajo del calendario */}
                {fecha && hora && (
                    <div className="seleccion-info">
                        <div className="seleccion-texto">
                            <p className="hora-seleccionada"><strong>Horario seleccionado</strong></p>
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
                {reservaError && <p className="error-message-consulta">{reservaError}</p>}
    
                {/* Botón de Reprogramar */}
                <div className="modal-buttons-container-outside">
                    <button type="button" className="button reservar" onClick={handleReprogramar}>Reprogramar</button>
                </div>
            </div>
        </div>
    );
    
};

export default ReprogramarConsulta;