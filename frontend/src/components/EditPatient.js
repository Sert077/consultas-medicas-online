import React, { useState, useEffect } from 'react';
import '../css/Register.css';

const EditPatient = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [idCard, setIdCard] = useState('');
    const [userPicture, setUserPicture] = useState(null);
    const [previewPicture, setPreviewPicture] = useState(null);
    const [loading, setLoading] = useState(true);

    // Obtener datos del paciente cuando el componente se monta
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await fetch('http://localhost:8000/api/patient/profile/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    setUsername(data.username);
                    setFirstName(data.first_name);
                    setLastName(data.last_name);
                    setEmail(data.email);
    
                    // Datos del perfil
                    if (data.perfil) {
                        setBirthdate(data.perfil.birthdate || '');
                        setPhoneNumber(data.perfil.phone_number || '');
                        setIdCard(data.perfil.id_card || '');
                        setPreviewPicture(data.perfil.user_picture || null);
                    }
                } else {
                    console.error('Error al obtener los datos');
                }
            } catch (error) {
                console.error('Error de red:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPatientData();
    }, []);    
    

    const handleUpdate = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('username', username);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        
        // Datos del perfil
        formData.append('birthdate', birthdate);
        formData.append('phone_number', phoneNumber);
        formData.append('id_card', idCard);
    
        if (userPicture) {
            formData.append('user_picture', userPicture);
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/patient/profile/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                },
                body: formData,
            });
    
            if (response.ok) {
                alert('Datos actualizados con éxito');
                localStorage.setItem('username', username); // Actualiza el localStorage
                
                // Emitir un evento personalizado
                const event = new Event('userUpdate');
                window.dispatchEvent(event);
            }
             else {
                alert('Error al actualizar los datos');
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        setUserPicture(file);
        if (file) {
            setPreviewPicture(URL.createObjectURL(file));
        }
    };

    return (
        <div className="register-container">
            <h2>Datos del Paciente</h2>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <form onSubmit={handleUpdate}>
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
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Fecha de Nacimiento:</label>
                        <input
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Número Telefónico:</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Cédula de Identidad:</label>
                        <input
                            type="text"
                            value={idCard}
                            onChange={(e) => setIdCard(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Foto de Perfil:</label>
                        <input type="file" accept="image/*" onChange={handlePictureChange} />
                        {previewPicture && (
                            <img
                            src={userPicture ? URL.createObjectURL(userPicture) : `http://localhost:8000${previewPicture}`}
                            alt="Previsualización"
                            style={{ width: '150px' }}
                        />
                        )}
                    </div>
                    <button type="submit">Actualizar Datos</button>
                </form>
            )}
        </div>
    );
};

export default EditPatient;
