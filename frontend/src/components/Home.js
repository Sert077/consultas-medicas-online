import React from 'react';
import '../css/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="hero-title">Bienvenido a la Plataforma de Consultas Médicas Online</h1>
                <p className="hero-subtitle">Tu salud en manos de los mejores especialistas</p>
                <div className="hero-buttons">
                    <a href="/doctores" className="hero-button">Médicos Disponibles</a>
                    <a href="/consultas" className="hero-button">Reservar Consulta</a>
                </div>
            </div>

            <div className="features-section">
                <div className="feature">
                    <img src="/path/to/icon1.png" alt="Icono 1" className="feature-icon" />
                    <h3 className="feature-title">Consulta Médica Online</h3>
                    <p className="feature-description">Realiza tus consultas de manera rápida y sencilla desde casa.</p>
                </div>
                <div className="feature">
                    <img src="/path/to/icon2.png" alt="Icono 2" className="feature-icon" />
                    <h3 className="feature-title">Médicos Especialistas</h3>
                    <p className="feature-description">Accede a una red de médicos especializados en diferentes áreas.</p>
                </div>
                <div className="feature">
                    <img src="/path/to/icon3.png" alt="Icono 3" className="feature-icon" />
                    <h3 className="feature-title">Historial Médico</h3>
                    <p className="feature-description">Consulta tu historial médico de manera segura y confidencial.</p>
                </div>
            </div>
            <br></br>
            <br></br>
        </div>
    );
};

export default Home;
