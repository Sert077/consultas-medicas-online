import { useState } from "react"
import { Shield, FileText, Lock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import "../css/InformacionLegal.css"

const InformacionLegal = () => {
  const [expandedSection, setExpandedSection] = useState("privacidad")

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  return (
    <div className="legal-container">
      <section className="legal-header">
        <div className="legal-header-content">
          <h1>Información Legal</h1>
          <p>
            Comprometidos con la transparencia y el cumplimiento de las normativas aplicables a servicios de
            telemedicina
          </p>
        </div>
      </section>

      <section className="legal-content">
        <div className="legal-card">
          <div
            className={`legal-card-header ${expandedSection === "titularidad" ? "active" : ""}`}
            onClick={() => toggleSection("titularidad")}
          >
            <div className="legal-card-title">
              <FileText className="legal-icon" />
              <h2>Titularidad del Sitio Web</h2>
            </div>
            {expandedSection === "titularidad" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSection === "titularidad" && (
            <div className="legal-card-body">
              <p>
                Este sitio web es propiedad de MediTest, con domicilio en Av. D'orbigny Km 5, y CI 8842677. Toda
                comunicación relacionada con la plataforma puede dirigirse a nuestro correo electrónico:{" "}
                <a href="mailto:servesa07@gmail.com">servesa07@gmail.com</a>.
              </p>
            </div>
          )}
        </div>

        <div className="legal-card">
          <div
            className={`legal-card-header ${expandedSection === "privacidad" ? "active" : ""}`}
            onClick={() => toggleSection("privacidad")}
          >
            <div className="legal-card-title">
              <Lock className="legal-icon" />
              <h2>Política de Privacidad y Protección de Datos</h2>
            </div>
            {expandedSection === "privacidad" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSection === "privacidad" && (
            <div className="legal-card-body">
              <p>
                En MediTest, la protección de sus datos personales y médicos es nuestra prioridad. Cumplimos con
                estándares similares a HIPAA para garantizar la confidencialidad de su información médica.
              </p>
              <ul>
                <li>
                  <strong>Recopilación de datos:</strong> Recopilamos únicamente la información necesaria para brindar
                  nuestros servicios médicos.
                </li>
                <li>
                  <strong>Uso de la información:</strong> Su información se utiliza exclusivamente para proporcionar
                  servicios médicos, mejorar nuestra plataforma y cumplir con obligaciones legales.
                </li>
                <li>
                  <strong>Almacenamiento seguro:</strong> Implementamos medidas de seguridad técnicas y organizativas
                  para proteger sus datos contra accesos no autorizados.
                </li>
                <li>
                  <strong>Derechos del usuario:</strong> Usted tiene derecho a acceder, rectificar y eliminar sus datos
                  personales.
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="legal-card">
          <div
            className={`legal-card-header ${expandedSection === "condiciones" ? "active" : ""}`}
            onClick={() => toggleSection("condiciones")}
          >
            <div className="legal-card-title">
              <Shield className="legal-icon" />
              <h2>Condiciones de Uso</h2>
            </div>
            {expandedSection === "condiciones" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSection === "condiciones" && (
            <div className="legal-card-body">
              <p>Al utilizar nuestra plataforma, usted acepta las siguientes condiciones:</p>
              <ul>
                <li>
                  <strong>Uso adecuado:</strong> La plataforma debe utilizarse únicamente para consultas médicas
                  legítimas.
                </li>
                <li>
                  <strong>Veracidad de la información:</strong> Los usuarios deben proporcionar información precisa y
                  veraz sobre su estado de salud.
                </li>
                <li>
                  <strong>Prohibición de uso indebido:</strong> Queda prohibido el uso de la plataforma para actividades
                  ilegales o fraudulentas.
                </li>
                <li>
                  <strong>Edad mínima:</strong> Los usuarios deben ser mayores de edad o contar con la autorización de
                  un tutor legal.
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="legal-card">
          <div
            className={`legal-card-header ${expandedSection === "propiedad" ? "active" : ""}`}
            onClick={() => toggleSection("propiedad")}
          >
            <div className="legal-card-title">
              <FileText className="legal-icon" />
              <h2>Propiedad Intelectual</h2>
            </div>
            {expandedSection === "propiedad" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSection === "propiedad" && (
            <div className="legal-card-body">
              <p>
                Todos los contenidos de este sitio, incluyendo textos, imágenes, logotipos, diseños, software y bases de
                datos, son propiedad de MediTest o de terceros que han autorizado su uso. Estos contenidos están
                protegidos por las leyes de propiedad intelectual y su uso no autorizado puede constituir una
                infracción.
              </p>
            </div>
          )}
        </div>

        <div className="legal-card">
          <div
            className={`legal-card-header ${expandedSection === "disclaimer" ? "active" : ""}`}
            onClick={() => toggleSection("disclaimer")}
          >
            <div className="legal-card-title">
              <AlertTriangle className="legal-icon" />
              <h2>Aviso Médico</h2>
            </div>
            {expandedSection === "disclaimer" ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSection === "disclaimer" && (
            <div className="legal-card-body">
              <p>
                MediTest proporciona una plataforma para conectar pacientes con profesionales médicos calificados. Sin
                embargo:
              </p>
              <ul>
                <li>
                  <strong>No sustituye la atención presencial:</strong> Las consultas en línea no reemplazan la atención
                  médica presencial en casos de emergencia.
                </li>
                <li>
                  <strong>Limitaciones del servicio:</strong> Existen limitaciones inherentes a la telemedicina que los
                  usuarios deben considerar.
                </li>
                <li>
                  <strong>Responsabilidad profesional:</strong> Cada profesional médico es responsable de sus propias
                  consultas y recomendaciones.
                </li>
              </ul>
              <p>En caso de emergencia médica, contacte inmediatamente a los servicios de emergencia locales.</p>
            </div>
          )}
        </div>
      </section>

      <section className="legal-footer">
        <p>
          Última actualización: Abril 2025. MediTest se reserva el derecho de modificar esta información legal en
          cualquier momento.
        </p>
      </section>
    </div>
  )
}

export default InformacionLegal
