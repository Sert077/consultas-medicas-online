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
    const data = new FormData();
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    data.append('email', formData.email);
    data.append('specialty', formData.specialty);
    data.append('phone_number', formData.phoneNumber);
    data.append('address', formData.address);
    data.append('profile_picture', formData.profilePicture);
    data.append('biography', formData.biography);

    const response = await fetch('http://127.0.0.1:8000/api/doctors/create/', {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    console.log(result);
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
                        placeholder="Introduzca el nombre del medico" 
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
                        placeholder="Introduzca los apellidos del medico" 
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
                        placeholder="Escriba un email valido" 
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
                    <label htmlFor="phoneNumber">Numero telefonico:</label>
                    <input 
                        type="text" 
                        id="phoneNumber" 
                        name="phoneNumber" 
                        value={formData.phoneNumber} 
                        onChange={handleChange}
                        placeholder="Introduzca un numero valido" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Direccion:</label>
                    <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange}
                        placeholder="Introduzca la direccion del consultorio medico" 
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
                    <label htmlFor="biography">Biografia descriptiva:</label>
                    <input 
                        type="text" 
                        id="biography" 
                        name="biography" 
                        value={formData.biography} 
                        onChange={handleChange}
                        placeholder="Describa los servicios y/o atenciones medicas que hara el medico" 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-primary">Registrar</button>
            </form>
        </div>
    );
};

export default RegisterDoctor;
