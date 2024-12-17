import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Doctores.css';

const Doctores = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');

    const specialties = [
        'Alergología', 'Cardiología', 'Dermatología', 'Endocrinología', 'Fisioterapia',
        'Gastroenterología', 'Geriatría', 'Ginecología', 'Hematología', 'Infectología',
        'Medicina General', 'Medicina Interna', 'Neumología', 'Neurología', 'Nefrología',
        'Nutrición', 'Oftalmología', 'Oncología', 'Otorrinolaringología', 'Pediatría',
        'Podiatría', 'Psicología', 'Psiquiatría', 'Reumatología', 'Salud Mental Infantil',
        'Sexología', 'Traumatología', 'Urología', 'Otros',
    ];

    useEffect(() => {
        fetch('http://localhost:8000/api/doctores/')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setDoctors(data);
                setFilteredDoctors(data);
            })
            .catch(error => console.error('Error fetching doctors:', error));
    }, []);

    // Filtra doctores según especialidad y término de búsqueda
    useEffect(() => {
        let filtered = doctors;
    
        if (selectedSpecialty) {
            if (selectedSpecialty === 'Otros') {
                // Mostrar doctores cuyas especialidades NO estén en la lista de specialties (exclusión)
                filtered = filtered.filter(doctor => !specialties.includes(doctor.specialty));
            } else {
                // Filtrar por la especialidad seleccionada
                filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
            }
        }
    
        if (searchTerm) {
            // Filtrar por término de búsqueda (nombre)
            filtered = filtered.filter(doctor =>
                `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
    
        setFilteredDoctors(filtered);
    }, [searchTerm, selectedSpecialty, doctors]);
    
    return (
        <div className="doctor-list-container">
            <h2 className="title">Lista de Doctores</h2>
    
            {/* Filtros y buscador */}
            <div className="filters">
                <select
                    className="filter-select"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                    <option value="">Todas las especialidades</option>
                    {specialties.map((specialty, index) => (
                        <option key={index} value={specialty}>
                            {specialty}
                        </option>
                    ))}
                </select>
    
                <div className="filter-search-container">
                    <input
                        type="text"
                        className="filter-search"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">
                        <i className="fas fa-search"></i>
                    </span>

                </div>

            </div>
    
            {/* Lista de doctores */}
            {filteredDoctors.length === 0 ? (
                // Mostrar mensaje cuando no haya doctores disponibles
                <div className="no-doctors-message">
                    No hay médicos disponibles
                </div>
            ) : (
                <ul className="doctor-list">
                    {filteredDoctors.map((doctor) => (
                        <li key={doctor.id} className="doctor-item">
                            <img
                                src={doctor.profile_picture}
                                alt={`${doctor.first_name} ${doctor.last_name}`}
                                className="doctor-image"
                            />
                            <div className="doctor-info">
                                <h3 className="doctor-name">Dr(a): {doctor.first_name} {doctor.last_name}</h3>
                                <p className="doctor-specialty">Especialidad: {doctor.specialty}</p>
                                <Link to={`/doctores/${doctor.id}`} className="more-info-button">
                                    Más información
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Doctores;
