import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState('/images/icon-user.png'); // Imagen por defecto


    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("username");
        const superUser = localStorage.getItem("is_superuser");
        const userType = localStorage.getItem("tipo_usuario");

        if (token && user) {
            setIsLoggedIn(true);
            setUsername(user);
            setIsSuperUser(superUser === "true");
        }

        const updateHeader = () => {
            const user = localStorage.getItem("username");
            setUsername(user);
        };
    
        // Escuchar cambios
        window.addEventListener('userUpdate', updateHeader);
    
        return () => {
            window.removeEventListener('userUpdate', updateHeader);
        };


    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("is_superuser");
        localStorage.removeItem("birthdate");
        localStorage.removeItem("email");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("paciente_id");
        localStorage.removeItem("tipo_usuario");

        setIsLoggedIn(false);
        setIsSuperUser(false);
        navigate("/login");
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen); // Alternar el estado del menú hamburguesa
    };

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const token = localStorage.getItem('token');
                const userType = localStorage.getItem('tipo_usuario');
    
                if (!token || !userType) return;
    
                let apiUrl = '';
                if (userType === 'paciente') {
                    apiUrl = 'http://localhost:8000/api/patient/profile/';
                } else if (userType === 'medico') {
                    apiUrl = 'http://localhost:8000/api/doctors/me/';
                }
    
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log("Datos obtenidos:", data);
                    if (userType === 'paciente' && data.perfil?.user_picture) {
                        setProfilePicture(`http://localhost:8000${data.perfil.user_picture}`);
                    } else if (userType === 'medico' && data.profile_picture) {
                        setProfilePicture(`http://localhost:8000${data.profile_picture}`);
                    }
                } else {
                    console.error('Error al obtener la foto de perfil');
                }
            } catch (error) {
                console.error('Error de red al obtener la foto de perfil:', error);
            }
        };
    
        fetchProfilePicture();
    }, []);
      

    return (
        <header className="header">
            <div className="logo">
                <img src="/images/logo.png" alt="Logo" />
                <div className="logo-text">
                    <span className="main-title">MEDITEST</span>
                    <span className="subtitle">Consultas médicas online</span>
                </div>
            </div>

            <button className="hamburger" onClick={toggleMenu}>
                {/* Icono de menú hamburguesa */}
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            <nav className={`navigation ${isMenuOpen ? "open" : ""}`}>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/doctores">Médicos</Link>
                    </li>

                    {isLoggedIn && (
                        <li>
                            <Link to="/misreservas">Mis Consultas</Link>
                        </li>
                    )}

                    <li>
                        <Link to="#!" className="disabled">
                            Conoce más!
                        </Link>
                    </li>

                    {isSuperUser && (
                        <li>
                            <Link to="/registerdoctor">Registrar Médico</Link>
                        </li>
                    )}
                    {isLoggedIn ? (
                        <li className="user-menu">
                            <span onClick={toggleDropdown}>
                                {username}{" "}
                                <img
                                    src={profilePicture}
                                    alt="Foto de perfil"
                                    onError={(e) => (e.target.src = '/images/icon-user.png')} // Imagen por defecto si falla
                                    className="profile-picture"
                                />
                            </span>
                            {showDropdown && (
                                <ul className="dropdown">
                                    <li>
                                        <button onClick={() => navigate('/edit-patient')}>Configuración de la cuenta</button>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout}>Cerrar sesión</button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ) : (
                        <li>
                            <Link to="/login">Iniciar sesión</Link>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;