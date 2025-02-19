import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, isSameDay } from "date-fns";

const ReprogramarConsulta = () => {
    const { token } = useParams(); // Obtener el token desde la URL
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [fecha, setFecha] = useState(null);
    const [hora, setHora] = useState("");
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        // Obtener información de la consulta usando el token
        fetch(`http://localhost:8000/api/consultas/reprogramar/${token}`)
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    setError("Este enlace no es válido o la consulta ya fue reprogramada.");
                } else {
                    setDoctor(data.doctor);
                }
            })
            .catch(error => console.error("Error al cargar consulta:", error));
    }, [token]);

    useEffect(() => {
        if (doctor) {
            const startHour = parseInt(doctor.start_time.split(":")[0]);
            const endHour = parseInt(doctor.end_time.split(":")[0]);

            const allTimeSlots = [];
            for (let hour = startHour; hour <= endHour; hour++) {
                allTimeSlots.push(`${hour}:00`);
            }
            setHorariosDisponibles(allTimeSlots);
        }
    }, [doctor]);

    const handleReprogramar = () => {
        if (!fecha || !hora) {
            setError("Debe seleccionar una fecha y una hora.");
            return;
        }

        fetch(`http://localhost:8000/api/consultas/reprogramar/${token}`, {
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

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="reprogramar-container">
            <h2>Reprogramar Consulta</h2>
            <label>Seleccione una nueva fecha:</label>
            <DatePicker selected={fecha} onChange={setFecha} minDate={addDays(new Date(), 1)} dateFormat="yyyy-MM-dd" />
            
            <label>Seleccione una nueva hora:</label>
            <select value={hora} onChange={(e) => setHora(e.target.value)}>
                <option value="">Seleccione una hora</option>
                {horariosDisponibles.map(hora => <option key={hora} value={hora}>{hora}</option>)}
            </select>

            <button onClick={handleReprogramar}>Reprogramar Consulta</button>
        </div>
    );
};

export default ReprogramarConsulta;
