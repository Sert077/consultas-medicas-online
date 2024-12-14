import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redireccionar después del login
import '../css/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook de navegación para redirigir

    const handleLogin = async (e) => {
        e.preventDefault();
    
        const response = await fetch('http://localhost:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });
    
        const data = await response.json();
        if (response.ok) {
            setMessage('Login successful');
            localStorage.setItem('token', data.token); // Guardar el token en localStorage
            localStorage.setItem('username', username); // Guardar el nombre de usuario en localStorage
            localStorage.setItem('is_superuser', data.is_superuser); // Guardar is_superuser en localStorage
            localStorage.setItem('paciente_id', data.id); // Guardar el id del usuario en localStorage como paciente_id
            localStorage.setItem('first_name', data.first_name); // Guardar el primer nombre en localStorage
            localStorage.setItem('last_name', data.last_name); // Guardar el apellido en localStorage
            localStorage.setItem('email', data.email); // Guardar el email en localStorage
            localStorage.setItem('tipo_usuario', data.tipo_usuario); // Guardar el tipo de usuario
            localStorage.setItem('birthdate', data.birthdate); // Guardar la fecha de nacimiento del usuario
            window.location.href = "/"; // Redirigir al home después de iniciar sesión
        } else {
            setMessage(data.error); // Mostrar el mensaje de error de la API
        }
    };    
    
    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Nombre de usuario:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Iniciar Sesión</button>
                <label className='button-registrarce'>No tienes cuenta? <a href="/register">Regístrate</a></label>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default Login;
