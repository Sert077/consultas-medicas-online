import { Link } from "react-router-dom"
import { Stethoscope, Calendar, Users, TrendingUp } from "lucide-react"
import "../css/MedicosSection.css"

const MedicosSection = () => {
  return (
    <section className="medicos-section">
      <h2 className="section-title animate-on-scroll">Para Profesionales Médicos</h2>

      <div className="medicos-intro animate-on-scroll">
        <h3>Únete a nuestra red de especialistas</h3>
        <p>
          MediTest ofrece a los profesionales médicos una plataforma innovadora para expandir su práctica y brindar
          atención de calidad a más pacientes.
        </p>
      </div>

      <div className="medicos-benefits">
        <div className="benefit-card animate-on-scroll">
          <div className="benefit-icon">
            <Calendar size={32} />
          </div>
          <h4>Flexibilidad Horaria</h4>
          <p>Gestiona tu agenda según tu disponibilidad. Tú decides cuándo y cuántas consultas atender.</p>
        </div>

        <div className="benefit-card animate-on-scroll">
          <div className="benefit-icon">
            <Users size={32} />
          </div>
          <h4>Amplía tu Base de Pacientes</h4>
          <p>Accede a pacientes de diferentes ubicaciones geográficas sin limitaciones físicas.</p>
        </div>

        <div className="benefit-card animate-on-scroll">
          <div className="benefit-icon">
            <Stethoscope size={32} />
          </div>
          <h4>Herramientas Especializadas</h4>
          <p>Utiliza nuestras herramientas digitales para diagnósticos, recetas y seguimiento de pacientes.</p>
        </div>

        <div className="benefit-card animate-on-scroll">
          <div className="benefit-icon">
            <TrendingUp size={32} />
          </div>
          <h4>Crecimiento Profesional</h4>
          <p>Forma parte de una comunidad médica innovadora y en constante crecimiento.</p>
        </div>
      </div>

      <div className="medicos-cta animate-on-scroll">
        <h3>¿Eres profesional médico y quieres formar parte de MediTest?</h3>
        <Link to="/conocenos#doctor-form" className="medicos-button">
          Únete como Especialista
        </Link>
      </div>
    </section>
  )
}

export default MedicosSection

