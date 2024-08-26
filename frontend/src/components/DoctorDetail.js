import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/DoctorDetail.css';

const DoctorDetail = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/api/doctores/${id}/`)
            .then(response => response.json())
            .then(data => setDoctor(data))
            .catch(error => console.error('Error fetching doctor details:', error));
    }, [id]);

    if (!doctor) {
        return <div>Loading...</div>;
    }

    return (
        <div className="doctor-detail-container">
            <div className="doctor-info-container">
                <img src={doctor.profile_picture} alt={`${doctor.first_name} ${doctor.last_name}`} className="doctor-image" />
                <div className="doctor-details">
                    <h2>Dr(a): {doctor.first_name} {doctor.last_name}</h2>
                    <p>Especialidad: {doctor.specialty}</p>
                    <p>Correo: {doctor.email}</p>
                    <p>Teléfono: {doctor.phone_number}</p>
                    <p>Dirección: {doctor.address}</p>
                    <div className="doctor-buttons">
                        <button className="consult-button">Reservar consulta médica</button>
                        <button className="consult-button">Realizar consulta médica</button>
                    </div>
                </div>
            </div>
            <div className="doctor-biography-container">
                <h3>Biografía</h3>
                <p>{doctor.biography}</p>
            </div>
            <br></br>
            
        </div>
    );
}

export default DoctorDetail;
