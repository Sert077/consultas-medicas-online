import React, { useState } from 'react';
import '../css/Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('paciente'); // Tipo de usuario

    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                first_name: firstName,
                last_name: lastName,
                email: email,
                perfil: {
                    tipo_usuario: tipoUsuario,
                },
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registro exitoso');
        } else {
            alert('Error al registrarse');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Nombre de Usuario:</label>
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
                <div>
                    <label>Nombre(s):</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Apellidos:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Tipo de Usuario:</label>
                    <select
                        value={tipoUsuario}
                        onChange={(e) => setTipoUsuario(e.target.value)}
                    >
                        <option value="paciente">Paciente</option>
                        <option value="medico">Médico</option>
                    </select>
                </div>
                <button type="submit">Registrar</button>
            </form>
        </div>
    );
};

export default Register;
