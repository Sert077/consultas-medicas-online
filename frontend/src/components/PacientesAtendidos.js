"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaCalendarAlt,
  FaClipboardList,
  FaInfoCircle,
  FaSort,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa"
import "../css/PacientesAtendidos.css"
import HistoriaClinicaModal from "./HistoriaClinicaModal" // Asumiendo que estás usando el modal que creamos antes

const PacientesAtendidos = ({ userId = localStorage.getItem("paciente_id") }) => {
  const [pacientes, setPacientes] = useState([])
  const [pacientesFiltrados, setPacientesFiltrados] = useState([])
  const [expandedPatient, setExpandedPatient] = useState(null)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [ordenAlfabetico, setOrdenAlfabetico] = useState("asc") // "asc" o "desc"

  const token = localStorage.getItem("token")
  const tipoUsuario = localStorage.getItem("tipo_usuario")

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/consultas/medico/${userId}/`)
      .then((response) => {
        const consultas = response.data

        // Agrupar las consultas por paciente
        const pacientesAgrupados = {}
        consultas.forEach((consulta) => {
          if (!pacientesAgrupados[consulta.paciente_name]) {
            pacientesAgrupados[consulta.paciente_name] = {
              nombre: consulta.paciente_name,
              foto: consulta.paciente_foto,
              consultas: 0,
              detalles: [],
            }
          }
          pacientesAgrupados[consulta.paciente_name].consultas += 1
          pacientesAgrupados[consulta.paciente_name].detalles.push(consulta)
        })

        // Convertir el objeto en un array para manejarlo en el estado
        const pacientesArray = Object.values(pacientesAgrupados)

        // Ordenar alfabéticamente
        const pacientesOrdenados = ordenarPacientes(pacientesArray, ordenAlfabetico)

        setPacientes(pacientesOrdenados)
        setPacientesFiltrados(pacientesOrdenados)
      })
      .catch((error) => console.error("Error al obtener los pacientes:", error))
  }, [userId])

  // Función para ordenar pacientes
  const ordenarPacientes = (pacientesArray, orden) => {
    return [...pacientesArray].sort((a, b) => {
      if (orden === "asc") {
        return a.nombre.localeCompare(b.nombre)
      } else {
        return b.nombre.localeCompare(a.nombre)
      }
    })
  }

  // Cambiar el orden alfabético
  const cambiarOrden = () => {
    const nuevoOrden = ordenAlfabetico === "asc" ? "desc" : "asc"
    setOrdenAlfabetico(nuevoOrden)

    const nuevoPacientesFiltrados = ordenarPacientes(pacientesFiltrados, nuevoOrden)
    setPacientesFiltrados(nuevoPacientesFiltrados)
  }

  // Filtrar pacientes por búsqueda
  const filtrarPacientes = (e) => {
    const terminoBusqueda = e.target.value.toLowerCase()
    setBusqueda(terminoBusqueda)

    if (terminoBusqueda.trim() === "") {
      setPacientesFiltrados(ordenarPacientes(pacientes, ordenAlfabetico))
    } else {
      const filtrados = pacientes.filter((paciente) => paciente.nombre.toLowerCase().includes(terminoBusqueda))
      setPacientesFiltrados(ordenarPacientes(filtrados, ordenAlfabetico))
    }
  }

  // Expandir/colapsar paciente
  const toggleExpand = (index) => {
    setExpandedPatient(expandedPatient === index ? null : index)
  }

  // Abrir modal de detalles
  const verDetallesConsulta = (consulta) => {
    setConsultaSeleccionada(consulta)
    setModalDetalleAbierto(true)
  }

  // Cerrar modal de detalles
  const cerrarModalDetalle = () => {
    setModalDetalleAbierto(false)
    setConsultaSeleccionada(null)
  }

  // Obtener el color según el estado de la consulta
  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "realizada":
        return "estado-realizada"
      case "cancelada":
        return "estado-cancelada"
      case "pendiente":
        return "estado-pendiente"
        case "reprogramada":
        return "estado-reprogramada"
      default:
        return ""
    }
  }

  // Formatear fecha para mostrar
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="pacientes-atendidos-container">
      <div className="pacientes-header">
        <h2>Pacientes</h2>
        <div className="pacientes-actions">
          <div className="search-container">
            <FaSearch className="search-icon-pacientes" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={busqueda}
              onChange={filtrarPacientes}
              className="search-input-pacientes"
            />
          </div>
          <button className="orden-btn" onClick={cambiarOrden}>
            {ordenAlfabetico === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
          </button>
        </div>
      </div>

      <div className="pacientes-table-container">
        <table className="pacientes-table">
          <thead>
            <tr>
              <th className="th-expand"></th>
              <th className="th-foto">Foto</th>
              <th className="th-nombre">
                Nombre del Paciente
                <button className="sort-btn-pacientes" onClick={cambiarOrden}>
                  <FaSort />
                </button>
              </th>
              <th className="th-consultas">Total Consultas</th>
              <th className="th-ultima">Última Consulta</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente, index) => (
                <React.Fragment key={index}>
                  {/* Fila principal del paciente */}
                  <tr
                    className={`paciente-row ${expandedPatient === index ? "expanded" : ""}`}
                    onClick={() => toggleExpand(index)}
                  >
                    <td className="td-expand">{expandedPatient === index ? <FaChevronDown /> : <FaChevronRight />}</td>
                    <td className="td-foto">
                      <img
                        src={paciente.foto ? `http://localhost:8000${paciente.foto}` : "/default-profile.png"}
                        alt={`Foto de ${paciente.nombre}`}
                        className="paciente-foto"
                      />
                    </td>
                    <td className="td-nombre">{paciente.nombre}</td>
                    <td className="td-consultas">{paciente.consultas}</td>
                    <td className="td-ultima">
                      {paciente.detalles.length > 0 && formatearFecha(paciente.detalles[0].fecha)}
                    </td>
                  </tr>

                  {/* Filas expandibles con las consultas */}
                  {expandedPatient === index && (
                    <tr className="consultas-container">
                      <td colSpan="5">
                        <div className="consultas-list">
                          <table className="consultas-table">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paciente.detalles.map((consulta, i) => (
                                <tr key={i} className="consulta-row">
                                  <td>
                                    <FaCalendarAlt className="consulta-icon" />
                                    {formatearFecha(consulta.fecha)}
                                  </td>
                                  <td>
                                    <FaClipboardList className="consulta-icon" />
                                    <span className="consulta-motivo">{consulta.motivo_consulta}</span>
                                  </td>
                                  <td>
                                    <span className={`consulta-estado ${getEstadoColor(consulta.estado)}`}>
                                      {consulta.estado}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      className="ver-detalles-btn"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        verDetallesConsulta(consulta)
                                      }}
                                    >
                                      <FaInfoCircle /> Detalles
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  {busqueda ? "No se encontraron pacientes con ese nombre" : "No hay pacientes atendidos"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para ver detalles de la consulta */}
      {modalDetalleAbierto && consultaSeleccionada && (
        <HistoriaClinicaModal
          modalDetalleAbierto={modalDetalleAbierto}
          consultaSeleccionada={consultaSeleccionada}
          cerrarModalDetalle={cerrarModalDetalle}
        />
      )}
    </div>
  )
}

export default PacientesAtendidos

