import React, { useState } from 'react';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty: '',
    phoneNumber: '',
    address: '',
    profilePicture: null,
    biography: '',
    horarioAtencion: '',
    username: '', // Campo para el nombre de usuario
    password: '', // Campo para la contraseña
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Paso 1: Crear el usuario en la tabla User junto con su perfil y doctor
    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('perfil.tipo_usuario', 'medico');  // Tipo de usuario médico

    // Añadir los datos del doctor
    formDataToSend.append('doctor.first_name', formData.firstName);
    formDataToSend.append('doctor.last_name', formData.lastName);
    formDataToSend.append('doctor.email', formData.email);
    formDataToSend.append('doctor.specialty', formData.specialty);
    formDataToSend.append('doctor.phone_number', formData.phoneNumber);
    formDataToSend.append('doctor.address', formData.address);
    formDataToSend.append('doctor.biography', formData.biography);
    formDataToSend.append('doctor.horario_atencion', formData.horarioAtencion);
    formDataToSend.append('doctor.profile_picture', formData.profilePicture);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
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
          <label htmlFor="specialty">Especialidad:</label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            placeholder="Introduzca una especialidad"
            required
          />
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
          <label htmlFor="horarioAtencion">Horario de Atención:</label>
          <input
            type="text"
            id="horarioAtencion"
            name="horarioAtencion"
            value={formData.horarioAtencion}
            onChange={handleChange}
            placeholder="Ej: Lunes a Viernes de 9am a 6pm"
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
