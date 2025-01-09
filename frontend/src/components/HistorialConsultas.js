import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/HistorialConsultas.css';

const HistorialConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [consultaEstado, setConsultaEstado] = useState('');
  const [reporteTipo, setReporteTipo] = useState('');
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const userIsSuperUser = localStorage.getItem('is_superuser') === 'true';
    setIsSuperUser(userIsSuperUser);
  }, []);

  useEffect(() => {
    if (isSuperUser) {
      const params = {};
  
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      if (busqueda) params.busqueda = busqueda;
      if (consultaEstado) params.consulta_estado = consultaEstado;
  
      axios.get('http://localhost:8000/api/historial-consultas/', { params })
        .then(response => {
          setConsultas(response.data.consultas);
          setRecetas(response.data.recetas);
        })
        .catch(error => console.error('Error al obtener los datos:', error));
    }
  }, [fechaInicio, fechaFin, busqueda, consultaEstado, isSuperUser]);  

  const generarReporte = () => {
    let url = 'http://localhost:8000/api/generar-reporte/';
    if (reporteTipo) {
      url += `?tipo=${reporteTipo}`;
    }
    window.open(url, '_blank');
  };  

  return (
    isSuperUser ? (
      <div className="historial-consultas">
        <h2>Historial de Consultas y Recetas</h2>

        {/* Filtros */}
        <div className="filtros">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
          />
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
          />
          <select 
            value={consultaEstado} 
            onChange={(e) => setConsultaEstado(e.target.value)} 
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <select 
            value={reporteTipo} 
            onChange={(e) => setReporteTipo(e.target.value)} 
          >
            <option value="">Seleccione tipo de reporte</option>
            <option value="estado">Consultas por estado</option>
            <option value="genero">Consultas por género</option>
            <option value="especialidad">Consultas por especialidad</option>
          </select>
        </div>

        {/* Botón de reporte */}
        <button onClick={generarReporte}>Generar Reporte PDF</button>

        {/* Consultas */}
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Genero</th>
              <th>Edad</th>
              <th>Tipo de sangre</th>
              <th>Estado</th>
              <th>Médico</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((consulta) => (
              <tr key={consulta.id}>
                <td>{consulta.fecha}</td>
                <td>{consulta.hora}</td>
                <td>{consulta.genero}</td>
                <td>{consulta.edad}</td>
                <td>{consulta.tipo_sangre}</td>
                <td>{consulta.estado}</td>
                <td>{consulta.medico__first_name} {consulta.medico__last_name}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Recetas */}
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th>Fecha de Creación</th>
              <th>Médico</th>
            </tr>
          </thead>
          <tbody>
            {recetas.map((receta) => (
              <tr key={receta.id}>
                <td>{receta.nombre_paciente}</td>
                <td>{receta.diagnostico}</td>
                <td>{new Date(receta.fecha_creacion).toLocaleDateString()}</td>
                <td>{receta.medico__first_name} {receta.medico__last_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div>No tienes permisos para ver este contenido.</div>
    )
  );
};

export default HistorialConsultas;
