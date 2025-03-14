import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    IconHome,
    IconUser,
    IconUsers,
    IconStethoscope,
    IconSettings,
    IconLogout,
    IconMenu,
    IconHelpCircle,
    IconCirclePlus,
    IconChartBar,
    IconChartLine,
    IconFileText,
    IconHistory    
} from "@tabler/icons-react";
import "../css/Header.css";
import { FaBars } from "react-icons/fa";
const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState('/images/icon-user.png'); // Imagen por defecto
    const dropdownRef = useRef(null);

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

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
            window.removeEventListener('userUpdate', updateHeader);
            document.removeEventListener("mousedown", handleClickOutside);
        };


    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setIsSuperUser(false);
        navigate("/login");
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
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
                <img src="/images/logo1.png" alt="Logo" />
                <div className="logo-text">
                    <span className="main-title">MEDITEST</span>
                    <span className="subtitle">Consultas médicas online</span>
                </div>
            </div>
    
            <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <FaBars size={24} className="icon-menu"/>
            </button>
    
            <nav className={`navigation ${isMenuOpen ? "open" : ""}`}>
                <ul>
                    <li>
                        <Link to="/">
                            <IconHome className="icon" />
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/doctores">
                            <IconStethoscope className="icon" />
                            Médicos
                        </Link>
                    </li>
    
                    {isLoggedIn && (
                        <li>
                            <Link to="/misreservas">
                                <IconUser className="icon-consultas" />
                                Mis Consultas
                            </Link>
                        </li>
                    )}
    
                    <li>
                        <Link to="/conocenos" className="disabled">
                            <IconHelpCircle className="icon-help" />
                            Conoce más!
                        </Link>
                    </li>
    
                    {isSuperUser && (
                        <li>
                            <Link to="/registerdoctor">
                                <IconCirclePlus className="icon-circle" />
                                Añadir Médico
                            </Link>
                        </li>
                    )}

                    {isSuperUser && (
                        <li>
                            <Link to="/historial-consultas">
                                <IconChartBar className="icon-circle" />
                                Historial
                            </Link>
                        </li>
                    )}
                    {isLoggedIn ? (
                        <li className="user-menu" ref={dropdownRef}>
                            <div onClick={toggleDropdown} className="user-info">
                                <span className="username">{username}</span>
                                <img
                                    src={profilePicture}
                                    alt="Foto de perfil"
                                    onError={(e) => (e.target.src = "/images/icon-user.png")}
                                    className="profile-picture"
                                />
                            </div>
                            {showDropdown && (
                                <ul className="dropdown">
                                    <li>
                                        <button onClick={() => navigate("/edit-patient")}>
                                            <IconSettings className="icon-settings" />
                                            Configuración de la cuenta
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleLogout}>
                                            <IconLogout className="icon-logout" />
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ) : (
                        <li>
                            <Link to="/login">
                                <IconUser className="icon" />
                                Iniciar sesión
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;