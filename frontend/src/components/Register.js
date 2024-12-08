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
    const [userPicture, setUserPicture] = useState(null);
    const [previewPicture, setPreviewPicture] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [nameError, setNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [birthdateError, setBirthdateError] = useState('');

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        setUserPicture(file);
        if (file) {
            setPreviewPicture(URL.createObjectURL(file));
        }
    };

    const handleRemovePicture = () => {
        setUserPicture(null);
        setPreviewPicture(null);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        setPasswordValid(passwordRegex.test(value));

        setPasswordsMatch(value === repeatPassword);
    };

    const handleRepeatPasswordChange = (e) => {
        const value = e.target.value;
        setRepeatPassword(value);
        setPasswordsMatch(password === value);
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
        setFirstName(value);

        if (!nameRegex.test(value)) {
            setNameError('Ingresa solo caracteres alfabéticos por favor.');
        } else {
            setNameError('');
        }
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        const lastNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
        setLastName(value);

        if (!lastNameRegex.test(value)) {
            setLastNameError('Ingresa solo caracteres alfabéticos por favor.');
        } else {
            setLastNameError('');
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
    
        // Verificar si contiene solo números
        const phoneRegex = /^\d*$/;
        if (!phoneRegex.test(value)) {
            setPhoneError('Ingresa solo caracteres numéricos por favor.');
        } else {
            setPhoneError('');
        }
    
        // Actualizar el estado del número telefónico
        setPhoneNumber(value);
    };

    const validateBirthdate = (date) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const inputDate = new Date(date);
        const inputYear = inputDate.getFullYear();

        if (inputYear > currentYear) {
            setBirthdateError('La fecha de nacimiento no puede ser mayor al año actual.');
            return false;
        } else if (currentYear - inputYear > 125) {
            setBirthdateError('La fecha de nacimiento no puede ser de hace más de 125 años.');
            return false;
        }

        setBirthdateError('');
        return true;
    };

    const handleBirthdateChange = (e) => {
        const value = e.target.value;
        setBirthdate(value);

        // Validar la fecha ingresada
        validateBirthdate(value);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateBirthdate(birthdate)) {
            alert('Por favor, corrige la fecha de nacimiento antes de continuar.');
            return;
        }

        if (!passwordValid) {
            alert('La contraseña no cumple con los requisitos.');
            return;
        }

        if (!passwordsMatch) {
            alert('Las contraseñas no coinciden');
            return;
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('perfil.tipo_usuario', 'paciente');
        formData.append('perfil.birthdate', birthdate);
        formData.append('perfil.phone_number', phoneNumber);
        formData.append('perfil.id_card', idCard);

        if (userPicture) {
            formData.append('perfil.user_picture', userPicture);
        }

        try {
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Registro exitoso');
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData);
                alert('Error al registrarse');
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de red al registrarse');
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
                        onChange={handleNameChange}
                        placeholder="Ingrese su nombre"
                        required
                        pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
                        maxLength="20"
                        onInvalid={(e) => e.target.setCustomValidity('Solo se permiten caracteres alfabeticos')}
                        onInput={(e) => e.target.setCustomValidity('')}
                    />
                    {nameError && <div style={{ color: 'red', fontSize: '12px' }}>{nameError}</div>}
                </div>
                <div>
                    <label>Apellidos:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={handleLastNameChange}
                        placeholder="Ingrese sus apellidos"
                        required
                        pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
                        maxLength="20"
                        onInvalid={(e) => e.target.setCustomValidity('Solo se permiten caracteres alfabeticos')}
                        onInput={(e) => e.target.setCustomValidity('')}
                    />
                    {lastNameError && <div style={{ color: 'red', fontSize: '12px' }}>{lastNameError}</div>}
                </div>
                <div>
    <label>Fecha de nacimiento:</label>
    <input
        type="date"
        value={birthdate}
        onChange={handleBirthdateChange}
        required
        max={new Date().toISOString().split('T')[0]} // Fecha máxima: hoy
        min={new Date(
            new Date().setFullYear(new Date().getFullYear() - 125)
        )
            .toISOString()
            .split('T')[0]} // Fecha mínima: hace 125 años
    />
    {birthdateError && (
        <div style={{ color: 'red', fontSize: '12px' }}>{birthdateError}</div>
    )}
</div>

                <div>
                    <label>Número telefónico:</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Ingrese su número de teléfono"
                        required
                        pattern="^\d+$"
                        maxLength="25"
                        onInvalid={(e) => e.target.setCustomValidity('Solo se permiten caracteres numéricos')}
                        onInput={(e) => e.target.setCustomValidity('')}
                    />
                    {phoneError && <div style={{ color: 'red', fontSize: '12px' }}>{phoneError}</div>}
                </div>
                <div>
                    <label>Cédula de Identidad:</label>
                    <input
                        type="text"
                        value={idCard}
                        onChange={(e) => setIdCard(e.target.value)}
                        placeholder="Ingrese su cédula de identidad"
                        required
                        maxLength="30"
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
                        maxLength="25"
                    />
                </div>
                <div>
                    <label htmlFor="profilePicture">Foto de perfil:</label>
                    <div className="file-input">
                        {previewPicture ? (
                            <>
                                <img
                                    src={previewPicture}
                                    alt="Previsualización"
                                    className="preview-image"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemovePicture}
                                    className="remove-picture-button"
                                >
                                    Eliminar imagen
                                </button>
                            </>
                        ) : (
                            <>
                                <label htmlFor="profilePicture" className="custom-file-label">
                                    Seleccionar archivo
                                </label>
                                <input
                                    type="file"
                                    id="profilePicture"
                                    name="profilePicture"
                                    accept="image/*"
                                    onChange={handlePictureChange}
                                    className="file-input-field"
                                />
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ingrese su correo electrónico"
                        required
                        maxLength="200"
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <div className="password-input">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
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
                    {!passwordValid && (
                        <div style={{ color: 'red', fontSize: '12px' }}>
                            La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.
                        </div>
                    )}
                </div>
                <div>
                    <label>Repetir Contraseña:</label>
                    <div className="password-input">
                        <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            value={repeatPassword}
                            onChange={handleRepeatPasswordChange}
                            placeholder="Repita su contraseña"
                            required
                            style={{
                                borderColor: repeatPassword && !passwordsMatch ? 'red' : '',
                            }}
                        />
                        <span
                            className="show-password-icon"
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        >
                            <i className={showRepeatPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}></i>
                        </span>
                    </div>
                    {repeatPassword && !passwordsMatch && (
                        <div style={{ color: 'red', fontSize: '12px' }}>
                            Las contraseñas no coinciden.
                        </div>
                    )}
                </div>

                <button type="submit">Registrar</button>
            </form>
        </div>
    );
};

export default Register;
