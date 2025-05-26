import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { isSuperUser } from '../utils/jwtUtils';
import '../css/HistorialConsultas.css';

const HistorialConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [consultaEstado, setConsultaEstado] = useState('');
  const [reporteTipo, setReporteTipo] = useState('');
  const [esSuperUsuario, setEsSuperUsuario] = useState(false);
  const [graficoTipo, setGraficoTipo] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    const userIsSuperUser = isSuperUser();
    setEsSuperUsuario(userIsSuperUser);
  }, []);

  useEffect(() => {
    if (esSuperUsuario) {
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
  }, [fechaInicio, fechaFin, busqueda, consultaEstado, esSuperUsuario]);  

  const generarReporte = () => {
    if(!fechaInicio || !fechaFin || !reporteTipo || !graficoTipo){
       setMensajeError('Por favor, seleccione la fecha inicial, fecha final, tipo de reporte y tipo de gráfico antes de generar el reporte.');
       return;
    }
    setMensajeError('');

    let url = 'http://localhost:8000/api/generar-reporte/';
    const params = new URLSearchParams();

    params.append('fecha_inicio', fechaInicio);
    params.append('fecha_fin', fechaFin);
    params.append('tipo', reporteTipo);
    params.append('grafico_tipo', graficoTipo);

    url += `?${params.toString()}`;
    window.open(url, '_blank');
  };  

  return (
     esSuperUsuario ? (
      <div className="historial-consultas">
        <h2>Historial de Consultas y Recetas</h2>

        {/* Filtros */}
        <div className="filtros">
        <div className="input-container-historial">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
          <span className="icono-lupa"><i className="fas fa-search"></i></span>
        </div>
          <label>Fecha inicial:</label><input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
          />
          <label>Fecha final:</label><input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
          />
          </div>
          
          <div className="filtros">
    <select 
      value={consultaEstado} 
      onChange={(e) => setConsultaEstado(e.target.value)} 
      className="select-filtros"
    >
      <option value="">Todos los estados</option>
      <option value="pendiente">Pendiente</option>
      <option value="realizada">Realizada</option>
      <option value="cancelada">Cancelada</option>
    </select>

    <select 
      value={reporteTipo} 
      onChange={(e) => setReporteTipo(e.target.value)} 
      className="select-filtros"
    >
      <option value="">Seleccione tipo de reporte</option>
      <option value="estado">Consultas por estado</option>
      <option value="genero">Consultas por género</option>
      <option value="especialidad">Consultas por especialidad</option>
      <option value="edad">Consultas por edad</option>
      <option value="tipo_sangre">Consultas por tipo de sangre</option>
      <option value="tipo_consulta">Consultas por tipo de consulta</option>
    </select>

    <select 
      value={graficoTipo} 
      onChange={(e) => setGraficoTipo(e.target.value)}
      className="select-filtros"
    >
      <option value="">Seleccione tipo de gráfico</option>
      <option value="barras_verticales">Barras Verticales</option>
      <option value="barras_horizontales">Barras Horizontales</option>
      <option value="pastel">Gráfico Circular</option>
    </select>
  </div>
        {/* Botón de reporte */}
      <div className="filtros">
        <div className="contenedor-reporte">
          <button onClick={generarReporte}>Generar Reporte PDF</button>
          {mensajeError && (
            <p className="mensaje-error">{mensajeError}</p>
          )}
        </div>
      </div>

        {/* Consultas */}
        <h3>Consultas</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Tipo consulta</th>
              <th>Médico</th>
              <th>Genero</th>
              <th>Edad</th>
              <th>Tipo de sangre</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((consulta) => (
              <tr key={consulta.id}>
                <td>{consulta.fecha}</td>
                <td>{consulta.hora}</td>
                <td>{consulta.tipo_consulta}</td>
                <td>{consulta.medico_nombre}</td>
                <td>{consulta.genero}</td>
                <td>{consulta.edad}</td>
                <td>{consulta.tipo_sangre}</td>
                <td>{consulta.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Recetas */}
        <h3>Recetas</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Diagnóstico</th>
              <th>Médico</th>
            </tr>
          </thead>
          <tbody>
            {recetas.map((receta) => (
              <tr key={receta.id}>
                <td>{new Date(receta.fecha_creacion).toLocaleDateString()}</td>
                <td>{receta.nombre_paciente}</td>
                <td>{receta.diagnostico}</td>
                
                <td>{receta.medico_nombre}</td>
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