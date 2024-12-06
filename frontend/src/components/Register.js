import React, { useState } from 'react';
import '../css/Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [idCard, setIdCard] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== repeatPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

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
                birthdate: birthdate,
                phone_number: phoneNumber,
                id_card: idCard,
                perfil: {
                    tipo_usuario: 'paciente',
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
            <h2>Registro de Paciente</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Nombre(s):</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ingrese su nombre"
                        required
                    />
                </div>
                <div>
                    <label>Apellidos:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ingrese sus apellidos"
                        required
                    />
                </div>
                <div>
                    <label>Fecha de nacimiento:</label>
                    <input
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Número telefónico:</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ingrese su número de teléfono"
                        required
                    />
                </div>
                <div>
                    <label>Cédula de Identidad:</label>
                    <input
                        type="text"
                        value={idCard}
                        onChange={(e) => setIdCard(e.target.value)}
                        placeholder="Ingrese su cédula de identidad"
                        required
                    />
                </div>
                <div>
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingrese un nombre de usuario"
                        required
                    />
                </div>
                <div>
          <label htmlFor="profilePicture">Foto de perfil:</label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
          />
        </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingrese su correo electrónico"
                        required
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <div className="password-input">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            required
                        />
                        <span
                            className="show-password-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                        </span>
                    </div>
                </div>
                <div>
                    <label>Repetir Contraseña:</label>
                    <div className="password-input">
                        <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            placeholder="Repita su contraseña"
                            required
                        />
                        <span
                            className="show-password-icon"
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        >
                            <i className={showRepeatPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                        </span>
                    </div>
                </div>

                <button type="submit">Registrar</button>
            </form>
        </div>
    );
};

export default Register;
