import React, { useState, useRef } from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";
import MapModal from './MapModal';
import "leaflet/dist/leaflet.css";

const RegisterDoctor = () => {
  
  const specialties = [
    'Alergología',
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Fisioterapia',
    'Gastroenterología',
    'Geriatría',
    'Ginecología',
    'Hematología',
    'Infectología',
    'Medicina General',
    'Medicina Interna',
    'Neumología',
    'Neurología',
    'Nefrología',
    'Nutrición',
    'Oftalmología',
    'Oncología',
    'Otorrinolaringología',
    'Pediatría',
    'Podiatría',
    'Psicología',
    'Psiquiatría',
    'Reumatología',
    'Salud Mental Infantil',
    'Sexología',
    'Traumatología',
    'Urología',
    'Otros', // Opción para escribir si falta alguna especialidad
  ];    
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    id_card: '',
    specialty: '',
    customSpecialty: '', // Para guardar el valor de la especialidad personalizada
    phoneNumber: '',
    address: '',
    lat: null, // Latitud
    lng: null, // Longitud
    profilePicture: null,
    biography: '',
    days: [],
    horarioInicio: '',
    horarioFin: '',
    consultaDuracion: '',
    modalidad: '',
    username: '',
    password: '',
    repeatPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showMap, setShowMap] = useState(false); // Controla la visibilidad del modal con el mapa
  const [previewPicture, setPreviewPicture] = useState(null);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  
    // Validar si las contraseñas coinciden
    if (name === 'repeatPassword' && value !== formData.password) {
      setPasswordError('Las contraseñas no coinciden');
    } else {
      setPasswordError('');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setFormData((prevData) => ({
            ...prevData,
            profilePicture: file, // Guarda el archivo en el formData
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewPicture(reader.result);
        };
        reader.readAsDataURL(file);
    }
};

const handleRemovePicture = () => {
    setPreviewPicture(null);

    // Reiniciar el input de archivo usando useRef
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
};

  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      specialty: value,
      customSpecialty: value === 'Otros' ? '' : value, // Si es "Otros", vaciar el campo personalizado
    });
  };

  const handleCustomSpecialtyChange = (e) => {
    setFormData({
      ...formData,
      customSpecialty: e.target.value,
    });
  };

  const handleConsultaDuracion = (duracion) => {
    setFormData({
      ...formData,
      consultaDuracion: formData.consultaDuracion === duracion ? '' : duracion,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Limpiar errores previos
    setLoading(true);

    // Determinar la especialidad final
    const finalSpecialty = formData.specialty === 'Otros' ? formData.customSpecialty : formData.specialty;
    const formattedAddress = `${formData.address} (${formData.lat}, ${formData.lng})`;

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('perfil.id_card', formData.id_card);
    formDataToSend.append('perfil.tipo_usuario', 'medico');
    formDataToSend.append('doctor.first_name', formData.firstName);
    formDataToSend.append('doctor.last_name', formData.lastName);
    formDataToSend.append('doctor.email', formData.email);
    formDataToSend.append('doctor.specialty', finalSpecialty); // Enviar la especialidad final
    formDataToSend.append('doctor.phone_number', formData.phoneNumber);
    formDataToSend.append('doctor.address', formattedAddress);
    formDataToSend.append('doctor.consulta_duracion', formData.consultaDuracion); 
    formDataToSend.append('doctor.modalidad_consulta', formData.modalidad); // Nuevo campo
    formDataToSend.append('doctor.biography', formData.biography);
    formDataToSend.append('doctor.days', formData.days);
    formDataToSend.append('doctor.start_time', formData.horarioInicio);
    formDataToSend.append('doctor.end_time', formData.horarioFin);
    formDataToSend.append('doctor.profile_picture', formData.profilePicture);

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 4000); // Ocultar después de 3s
      } else {
        setErrors(data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error en el registro');
    }
    finally {
      setLoading(false); // Desactivar el spinner
  }
  };

  const handleDayButtonClick = (day) => {
    // Asegurarte de que siempre sea un arreglo
    const currentDays = Array.isArray(formData.days) ? formData.days : [];
    
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day) // Quitar el día si ya está seleccionado
      : [...currentDays, day]; // Agregar el día si no está
  
    setFormData({ ...formData, days: updatedDays });
  };  
  
  const getDayName = (day) => {
    const days = {
      L: "Lunes",
      M: "Martes",
      X: "Miércoles",
      J: "Jueves",
      V: "Viernes",
      S: "Sábado",
      D: "Domingo",
    };
    return days[day];
  };
  
  return (
    <div className="container">
      <h2>Registrar Doctor</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">Nombre:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Introduzca el nombre"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Apellidos:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Introduzca los apellidos"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="id_card">Cedula de Identidad:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            id="id_card"
            name="id_card"
            value={formData.id_card}
            onChange={handleChange}
            placeholder="Ingrese su cédula de identidad"
            maxLength="20"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialty">Especialidad:<span style={{ color: 'red' }}> *</span></label>
          <select
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleSpecialtyChange}
            required
          >
            <option value="">Seleccione una especialidad<span style={{ color: 'red' }}> *</span></option>
            {specialties.map((specialty, index) => (
              <option key={index} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          {formData.specialty === 'Otros' && (
            <input
              type="text"
              id="customSpecialty"
              name="customSpecialty"
              value={formData.customSpecialty}
              onChange={handleCustomSpecialtyChange}
              placeholder="Introduzca la especialidad"
              required
            />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">Dirección del Consultorio:<span style={{ color: 'red' }}> *</span></label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Seleccione en el mapa"
              required
              readOnly
            />
            <button
              type="button"
              className="location-btn"
              onClick={() => setShowMap(true)}
            >
              <FaMapMarkerAlt />
            </button>
          </div>
        </div> 

        <div className="form-group">
          <label htmlFor="phoneNumber">Teléfono:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="number"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Número telefónico"
            maxLength="10"
            required
          />
        </div>

        <div className="form-dias-horarios">
          <label>Días de Atención:<span style={{ color: 'red' }}> *</span></label>
          <div className="predefined-options">
            <button
              type="button"
              className={`day-button ${formData.days.length === 5 && formData.days.every(day => ["L", "M", "X", "J", "V"].includes(day)) ? "selected" : ""}`}
              onClick={() =>
                setFormData({
                  ...formData,
                  days: formData.days.length === 5 && formData.days.every(day => ["L", "M", "X", "J", "V"].includes(day))
                    ? [] // Deselecciona
                    : ["L", "M", "X", "J", "V"], // Selecciona "Lunes a Viernes"
                })
              }
            >
              Lunes a Viernes
            </button>
            <button
              type="button"
              className={`day-button ${formData.days.length === 7 ? "selected" : ""}`}
              onClick={() =>
                setFormData({
                  ...formData,
                  days: formData.days.length === 7
                    ? [] // Deselecciona
                    : ["L", "M", "X", "J", "V", "S", "D"], // Selecciona "Todos los días"
                })
              }
            >
              Todos los días
            </button>
          </div>
          
          <div className="custom-days">
            <label>Días personalizados:</label>
            <div className="day-buttons-group">
            {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => (
              <button
                key={index}
                type="button"
                className={`day-button-custom ${Array.isArray(formData.days) && formData.days.includes(day) ? "selected" : ""}`}
                onClick={() => handleDayButtonClick(day)}
              >
                {getDayName(day)}
              </button>
            ))}
            </div>
          </div>
        </div>

        <div className="form-group time-fields-wrapper"> 
        <label htmlFor="time-fields">Horario:<span style={{ color: 'red' }}> *</span></label>
          <div className="time-fields"> 
            <label htmlFor="horarioInicio">De (Hrs):</label> 
            <input type="time" 
            id="horarioInicio" 
            name="horarioInicio" 
            value={formData.horarioInicio} 
            onChange={handleChange} 
            required /> <label 
            htmlFor="horarioFin">A (Hrs):
            </label> 
            <input type="time" 
            id="horarioFin" 
            name="horarioFin" 
            value={formData.horarioFin} 
            onChange={handleChange} 
            required /> 
          </div> 
      
          <label className='duracion-consultas'>Duración de Consulta:<span style={{ color: 'red' }}> *</span></label>
          <div className="predefined-options-consultas">
            {["15 min", "30 min", "45 min", "1 hora"].map((duracion, index) => (
              <button
                key={index}
                type="button"
                className={`day-button ${formData.consultaDuracion === duracion ? "selected" : ""}`}
                onClick={() => handleConsultaDuracion(duracion)}
              >
                {duracion}
              </button>
            ))}
          </div>
          <div className="form-group-modalidad">
          <label htmlFor="modalidad" className='modalidad'>Modalidad de Consulta:<span style={{ color: 'red' }}> *</span></label>
              <select
                id="modalidad"
                name="modalidad"
                value={formData.modalidad}
                onChange={handleChange}
                className='modalidad'
                required
              >
                <option value="">Seleccione una modalidad</option>
                <option value="hibrida">Híbrida</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
              </select>
              </div>
        </div>

        <div className="form-group">
            <label htmlFor="profilePicture">Foto de perfil:<span style={{ color: 'red' }}> *</span></label>
            <div className="file-input">
                {previewPicture ? (
                    <>
                        <img
                            src={previewPicture}
                            alt="Previsualización"
                            className="preview-image-custom"
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
                            onChange={handleFileChange}
                            className="file-input-field"
                            ref={fileInputRef} // Asignamos la referencia aquí
                            required
                        />
                    </>
                )}
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="biography">Biografía:<span style={{ color: 'red' }}> *</span></label>
          <textarea
            id="biography"
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            placeholder="Breve descripción"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Escriba un email válido"
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="username">Usuario:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            required
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="form-group">
      <label htmlFor="password">Contraseña:<span style={{ color: 'red' }}> *</span></label>
      <div className="password-container">
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Cree una contraseña"
          required
        />
        <i 
          className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}
          onClick={() => setShowPassword(!showPassword)}
        ></i>
      </div>
    </div>

    {/* Campo de Repetir Contraseña */}
    <div className="form-group">
      <label htmlFor="repeatPassword">Repetir contraseña:<span style={{ color: 'red' }}> *</span></label>
      <div className="password-container">
        <input
          type={showRepeatPassword ? 'text' : 'password'}
          id="repeatPassword"
          name="repeatPassword"
          value={formData.repeatPassword}
          onChange={handleChange}
          placeholder="Repita su contraseña"
          required
        />
        <i 
          className={showRepeatPassword ? 'fa fa-eye-slash' : 'fa fa-eye'}
          onClick={() => setShowRepeatPassword(!showRepeatPassword)}
        ></i>
      </div>
      {passwordError && <p className="error-text">{passwordError}</p>}
    </div>
    <button type="submit" className="btn btn-primary" disabled={loading}>
      {loading ? (
        <>
          <span className="spinner-register"></span>
        </>
      ) : (
        "Registrar"
      )}
    </button>

    {successMessage && (
      <div className="success-message-overlay">
        <div className="success-message-content">
          <p>Doctor registrado exitosamente!</p>
          <button onClick={() => setSuccessMessage(false)}>✖</button>
        </div>
      </div>
    )}

      </form>
      {showMap && (
        <MapModal
          setShowMap={setShowMap}
          setFormData={setFormData}
          formData={formData}
        />
      )}
    </div>
  );
};

export default RegisterDoctor;