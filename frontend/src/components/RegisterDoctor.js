import React, { useState } from 'react';

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
    specialty: '',
    customSpecialty: '', // Para guardar el valor de la especialidad personalizada
    phoneNumber: '',
    address: '',
    profilePicture: null,
    biography: '',
    days: [],
    horarioInicio: '',
    horarioFin: '',
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePicture: e.target.files[0],
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determinar la especialidad final
    const finalSpecialty = formData.specialty === 'Otros' ? formData.customSpecialty : formData.specialty;

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('perfil.tipo_usuario', 'medico');
    formDataToSend.append('doctor.first_name', formData.firstName);
    formDataToSend.append('doctor.last_name', formData.lastName);
    formDataToSend.append('doctor.email', formData.email);
    formDataToSend.append('doctor.specialty', finalSpecialty); // Enviar la especialidad final
    formDataToSend.append('doctor.phone_number', formData.phoneNumber);
    formDataToSend.append('doctor.address', formData.address);
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

      if (response.ok) {
        alert('Doctor registrado exitosamente');
      } else {
        alert('Error al registrar el doctor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error en el registro');
    }
  };

  const handleDaysChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData({
      ...formData,
      days: selectedOptions.join(', '), // Convertimos a formato "L, M, X, J, V"
    });
  };
  
  const handleCustomDaysChange = (e) => {
    const selectedDay = e.target.value;
    const updatedDays = formData.days.includes(selectedDay)
      ? formData.days.replace(selectedDay, "").replace(/,,/g, ",").replace(/^,|,$/g, "")
      : [...formData.days.split(","), selectedDay].join(",");
  
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
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="firstName">Nombre:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Introduzca el nombre del médico"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Apellidos:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Introduzca los apellidos del médico"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="specialty">Especialidad:</label>
          <select
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleSpecialtyChange}
            required
          >
            <option value="">Seleccione una especialidad</option>
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
          <label htmlFor="phoneNumber">Número telefónico:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Introduzca un número válido"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Dirección:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Introduzca la dirección del consultorio médico"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="profilePicture">Foto de perfil:</label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleFileChange}
          />
        </div>
        <div className="form-group">
          <label>Días de Atención:</label>
          <div className="predefined-options">
            <button
              type="button"
              className={`day-button ${formData.days === "L,M,X,J,V" ? "selected" : ""}`}
              onClick={() => setFormData({ ...formData, days: "L,M,X,J,V" })}
            >
              Lunes a Viernes
            </button>
            <button
              type="button"
              className={`day-button ${formData.days === "L,M,X,J,V,S,D" ? "selected" : ""}`}
              onClick={() => setFormData({ ...formData, days: "L,M,X,J,V,S,D" })}
            >
              Todos los días
            </button>
          </div>

          <div className="custom-days">
            <label>Días personalizados:</label>
            <div className="checkbox-group">
              {["L", "M", "X", "J", "V", "S", "D"].map((day, index) => (
                <div key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    value={day}
                    checked={formData.days.includes(day)}
                    onChange={(e) => handleCustomDaysChange(e)}
                  />
                  <label htmlFor={`day-${day}`}>{getDayName(day)}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="horarioInicio">De (Hrs):</label>
          <input
            type="time"
            id="horarioInicio"
            name="horarioInicio"
            value={formData.horarioInicio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="horarioFin">A (Hrs):</label>
          <input
            type="time"
            id="horarioFin"
            name="horarioFin"
            value={formData.horarioFin}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="biography">Biografía:</label>
          <input
            type="text"
            id="biography"
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            placeholder="Describa los servicios y/o atenciones médicas del médico"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Cree un nombre de usuario"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">e-mail:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Escriba un email válido"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Cree una contraseña"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Registrar</button>
      </form>
    </div>
  );
};

export default RegisterDoctor;
