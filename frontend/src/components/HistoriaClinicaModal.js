"use client"
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaClipboardList,
  FaVenusMars,
  FaTint,
  FaAllergies,
  FaBirthdayCake,
  FaStethoscope,
  FaBaby,
  FaFilePdf,
  FaTimes,
} from "react-icons/fa"
import "../css/HistoriaClinicaModal.css"

const HistoriaClinicaModal = ({ modalDetalleAbierto, consultaSeleccionada, cerrarModalDetalle }) => {
  if (!modalDetalleAbierto || !consultaSeleccionada) return null

  return (
    <div className="historia-modal-overlay" onClick={cerrarModalDetalle}>
      <div className="historia-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="historia-modal-header">
          <h2>
            <FaClipboardList /> Historia Clínica
          </h2>
          <button className="historia-close-btn" onClick={cerrarModalDetalle}>
            <FaTimes />
          </button>
        </div>

        <div className="historia-modal-body">
          <div className="historia-columns">
            <div className="historia-left-column">
              {/* Información del paciente */}
              <div className="historia-section">
                <h3>Información del Paciente</h3>
                <div className="historia-info-item">
                  <FaUser className="historia-icon" />
                  <div>
                    <span className="historia-label">Paciente:</span>
                    <span className="historia-value">{consultaSeleccionada.paciente_name}</span>
                  </div>
                </div>

                <div className="historia-info-item">
                  <FaVenusMars className="historia-icon" />
                  <div>
                    <span className="historia-label">Género:</span>
                    <span className="historia-value">{consultaSeleccionada.genero}</span>
                  </div>
                </div>

                <div className="historia-info-item">
                  <FaBirthdayCake className="historia-icon" />
                  <div>
                    <span className="historia-label">Edad:</span>
                    <span className="historia-value">{consultaSeleccionada.edad} años</span>
                  </div>
                </div>

                <div className="historia-info-item">
                  <FaTint className="historia-icon" />
                  <div>
                    <span className="historia-label">Tipo de Sangre:</span>
                    <span className="historia-value">{consultaSeleccionada.tipo_sangre}</span>
                  </div>
                </div>

                {consultaSeleccionada.embarazo !== null && (
                  <div className="historia-info-item">
                    <FaBaby className="historia-icon" />
                    <div>
                      <span className="historia-label">Embarazo:</span>
                      <span className="historia-value">{consultaSeleccionada.embarazo ? "Sí" : "No"}</span>
                    </div>
                  </div>
                )}

                <div className="historia-info-item">
                  <FaAllergies className="historia-icon" />
                  <div>
                    <span className="historia-label">Alergias:</span>
                    <span className="historia-value">{consultaSeleccionada.alergias || "Ninguna"}</span>
                  </div>
                </div>
              </div>

              {/* Información de la consulta */}
              <div className="historia-section">
                <h3>Detalles de la Consulta</h3>
                <div className="historia-info-item">
                  <FaCalendarAlt className="historia-icon" />
                  <div>
                    <span className="historia-label">Fecha:</span>
                    <span className="historia-value">{consultaSeleccionada.fecha}</span>
                  </div>
                </div>

                <div className="historia-info-item">
                  <FaClock className="historia-icon" />
                  <div>
                    <span className="historia-label">Hora:</span>
                    <span className="historia-value">{consultaSeleccionada.hora}</span>
                  </div>
                </div>

                <div className="historia-info-item">
                  <FaStethoscope className="historia-icon" />
                  <div>
                    <span className="historia-label">Tipo de consulta:</span>
                    <span className="historia-value">{consultaSeleccionada.tipo_consulta}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="historia-right-column">
              {/* Foto del paciente */}
              {consultaSeleccionada.paciente_foto && (
                <div className="historia-foto-container">
                  <img
                    src={`http://localhost:8000${consultaSeleccionada.paciente_foto}`}
                    alt="Foto del paciente"
                    className="historia-paciente-foto"
                  />
                </div>
              )}

              {/* Motivo de consulta */}
              <div className="historia-section historia-motivo-section">
                <h3>Motivo de Consulta</h3>
                <div className="historia-motivo">{consultaSeleccionada.motivo_consulta}</div>
              </div>

              {/* Documentos adjuntos */}
              {consultaSeleccionada.archivo_pdf && (
                <div className="historia-section">
                  <h3>Documentos Adjuntos</h3>
                  <a
                    href={`http://localhost:8000${consultaSeleccionada.archivo_pdf}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="historia-pdf-link"
                  >
                    <FaFilePdf className="historia-pdf-icon" />
                    <span>Descargar Análisis (PDF)</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="historia-modal-footer">
          <button className="historia-close-modal-btn" onClick={cerrarModalDetalle}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoriaClinicaModal

