import React, { useState, useEffect } from 'react';
import '../css/EditPatient.css';

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
    const [passwordResetRequested, setPasswordResetRequested] = useState(false)
    const [passwordResetError, setPasswordResetError] = useState("")

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

    // Función para activar el input de archivo al hacer clic en la imagen o el overlay
    const triggerFileInput = () => {
    document.getElementById("profile-picture").click()
    }

    // Función para solicitar cambio de contraseña
  const handlePasswordReset = async () => {
    setPasswordResetRequested(false)
    setPasswordResetError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch('http://localhost:8000/api/patient/request-password-reset/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setPasswordResetRequested(true)
      } else {
        const errorData = await response.json()
        setPasswordResetError(errorData.error || "Error al solicitar cambio de contraseña")
      }
    } catch (error) {
      console.error("Error de red:", error)
      setPasswordResetError("Error de conexión. Inténtalo más tarde.")
    }
  }

    return (
        <div className="register-container-patient">
          <h2>Datos del Paciente</h2>
          {loading ? (
            <p className="loading-message">Cargando...</p>
          ) : (
            <form onSubmit={handleUpdate}>
              <div className="form-layout-patient">
                {/* Sección de foto de perfil */}
                <div className="profile-section-patient">
                  <div
                    className="profile-picture-container-patient"
                    onClick={triggerFileInput} // Añadir evento de clic
                  >
                    <img
                      src={
                        userPicture
                          ? URL.createObjectURL(userPicture)
                          : previewPicture
                            ? `http://localhost:8000${previewPicture}`
                            : "/placeholder-profile.jpg"
                      }
                      alt="Foto de perfil"
                      className="profile-picture-patient"
                    />
                    <div className="profile-picture-overlay-patient">Cambiar foto</div>
                  </div>
                  <div className="file-input-container-patient">
                    <label htmlFor="profile-picture" className="custom-file-upload-patient">
                      <i className="fas fa-camera"></i> Seleccionar imagen
                    </label>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handlePictureChange}
                      className="file-input-patient"
                    />
                  </div>
                  {/* Botón de cambio de contraseña */}
              <button type="button" className="password-change-button-patient" onClick={handlePasswordReset}>
                <i className="fas fa-shield-alt"></i> Cambiar contraseña
              </button>

              {/* Mensaje de confirmación o error */}
              {passwordResetRequested && (
                <div className="password-reset-success">
                  <i className="fas fa-check-circle"></i>
                  Se ha enviado un correo con instrucciones para cambiar tu contraseña.
                </div>
              )}

              {passwordResetError && (
                <div className="password-reset-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordResetError}
                </div>
              )}
                </div>
    
                {/* Sección de campos del formulario */}
                <div className="form-fields-patient">
    
                  <div className="form-group-patient readonly">
                    <label htmlFor="firstName">
                      <i className="fas fa-id-card"></i> Nombre(s)
                      <span className="readonly-badge-patient">
                        <i className="fas fa-lock"></i> No editable
                      </span>
                    </label>
                    <input id="firstName" type="text" value={firstName} readOnly />
                  </div>
    
                  <div className="form-group-patient readonly">
                    <label htmlFor="lastName">
                      <i className="fas fa-id-card"></i> Apellidos
                      <span className="readonly-badge-patient">
                        <i className="fas fa-lock"></i> No editable
                      </span>
                    </label>
                    <input id="lastName" type="text" value={lastName} readOnly />
                  </div>

                  <div className="form-group-patient readonly">
                    <label htmlFor="birthdate">
                      <i className="fas fa-calendar"></i> Fecha de Nacimiento
                      <span className="readonly-badge-patient">
                        <i className="fas fa-lock"></i> No editable
                      </span>
                    </label>
                    <input id="birthdate" type="date" value={birthdate} readOnly />
                  </div>

                  <div className="form-group-patient readonly">
                    <label htmlFor="idCard">
                      <i className="fas fa-id-card"></i> Cédula de Identidad
                      <span className="readonly-badge-patient">
                        <i className="fas fa-lock"></i> No editable
                      </span>
                    </label>
                    <input id="idCard" type="text" value={idCard} readOnly />
                  </div>
    
                  <div className="form-group-patient">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i> Correo Electrónico
                    </label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="form-group-patient">
                    <label htmlFor="username">
                      <i className="fas fa-user"></i> Nombre de Usuario
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
    
                  <div className="form-group-patient">
                    <label htmlFor="phoneNumber">
                      <i className="fas fa-phone"></i> Número Telefónico
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
    
                  <div className="update-button-container-patient">
                    <button type="submit" className="register-button-patient">
                      <i className="fas fa-save"></i> Actualizar Datos
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )
};

export default EditPatient;
