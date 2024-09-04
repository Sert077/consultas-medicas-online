import React from 'react';
import '../css/Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <img src="/path/to/logo.png" alt="Logo" />
                <span>Consultas Médicas Online</span>
            </div>
            <nav className="navigation">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/doctores">Médicos</a></li>                    
                    <li><a href="#!" className="disabled">Conoce mas!</a></li>
                    <li><a href="/register">Registrar Médico</a></li>
                    <li><a href="#!" className="disabled">Usuario</a></li>
                    <li><img src="/images/icon-user.png" alt="user" /></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
