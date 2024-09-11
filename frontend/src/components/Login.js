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
            window.location.href = "/"; // Redirigir al home después de iniciar sesión
        } else {
            setMessage('Login failed: ' + data.error);
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
