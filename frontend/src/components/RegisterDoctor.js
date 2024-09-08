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

    // Paso 1: Crear el usuario en la tabla User junto con su perfil
    const userData = {
      username: formData.username,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      perfil: {
        tipo_usuario: 'medico', // Tipo de usuario médico
      },
    };

    try {
      const userResponse = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (userResponse.ok) {
        const userResult = await userResponse.json();

        // Paso 2: Crear el doctor con el user_id recibido
        const data = new FormData();
        data.append('first_name', formData.firstName);
        data.append('last_name', formData.lastName);
        data.append('email', formData.email);
        data.append('specialty', formData.specialty);
        data.append('phone_number', formData.phoneNumber);
        data.append('address', formData.address);
        data.append('profile_picture', formData.profilePicture);
        data.append('biography', formData.biography);
        data.append('horario_atencion', formData.horarioAtencion); // Enviar el horario de atención
        data.append('user', userResult.id); // Asociar el ID del usuario creado

        const doctorResponse = await fetch('http://127.0.0.1:8000/api/doctors/create/', {
          method: 'POST',
          body: data,
        });

        if (doctorResponse.ok) {
          alert('Doctor registrado exitosamente');
        } else {
          alert('Error al registrar el doctor');
        }
      } else {
        alert('Error al crear el usuario médico');
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
