import React, { useEffect, useState } from 'react';
import '../css/Doctores.css';

const Doctores = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/doctors/')
            .then(response => response.json())
            .then(data => setDoctors(data))
            .catch(error => console.error('Error fetching doctors:', error));
    }, []);

    return (
        <div className="doctor-list-container">
            <h2 className="title">Lista de Doctores</h2>
            <ul className="doctor-list">
                {doctors.map((doctor, index) => (
                    <li key={index} className="doctor-item">
                        <img
                            src={doctor.profile_picture}
                            alt={`${doctor.first_name} ${doctor.last_name}`}
                            className="doctor-image"
                        />
                        <div className="doctor-info">
                            <h3 className="doctor-name">{doctor.first_name} {doctor.last_name}</h3>
                            <p className="doctor-specialty">Especialidad: {doctor.specialty}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Doctores;
