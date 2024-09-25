import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('username');
        const superUser = localStorage.getItem('is_superuser');
    
        if (token && user) {
            setIsLoggedIn(true);
            setUsername(user);
            setIsSuperUser(superUser === 'true');
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('is_superuser');

        setIsLoggedIn(false);
        setIsSuperUser(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <header className="header">
            <div className="logo">
                <img src="/path/to/logo.png" alt="Logo" />
                <span>Consultas Médicas Online</span>
            </div>
            <nav className="navigation">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/doctores">Médicos</Link></li>

                    {/* Mostrar "Mis Reservas" solo si el usuario ha iniciado sesión */}
                    {isLoggedIn && (
                        <li><Link to="/misreservas">Mis Reservas</Link></li>
                    )}

                    <li><Link to="#!" className="disabled">Conoce más!</Link></li>

                    {isSuperUser && (
                        <li><Link to="/registerdoctor">Registrar Médico</Link></li>
                    )}

                    {isLoggedIn ? (
                        <li className="user-menu">
                            <span onClick={toggleDropdown}>
                                {username} <img src="/images/icon-user.png" alt="user" />
                            </span>
                            {showDropdown && (
                                <ul className="dropdown">
                                    <li><button to="/config">Configuración de la cuenta</button></li>
                                    <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                                </ul>
                            )}
                        </li>
                    ) : (
                        <li><Link to="/login">Iniciar sesión</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
