import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Doctores.css';

const Doctores = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/doctores/')
            .then(response => response.json())
            .then(data => {
                console.log(data); // Verifica la estructura de los datos aquí
                setDoctors(data);
            })
            .catch(error => console.error('Error fetching doctors:', error));
    }, []);

    return (
        <div className="doctor-list-container">
            <h2 className="title">Lista de Doctores</h2>
            <ul className="doctor-list">
                {doctors.map((doctor) => (
                    <li key={doctor.id} className="doctor-item">  {/* Usando doctor.id como clave */}
                        <img
                            src={doctor.profile_picture}
                            alt={`${doctor.first_name} ${doctor.last_name}`}
                            className="doctor-image"
                        />
                        <div className="doctor-info">
                            <h3 className="doctor-name">{doctor.first_name} {doctor.last_name}</h3>
                            <p className="doctor-specialty">Especialidad: {doctor.specialty}</p>
                            <Link to={`/doctores/${doctor.id}`} className="more-info-button">
                                Más información
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Doctores;
