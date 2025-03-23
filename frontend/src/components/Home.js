"use client"
import { useEffect, useState  } from "react"
import { Link } from "react-router-dom"
import HeroSection from "./HeroSection" // Importa el nuevo componente
import MedicosSection from "./MedicosSection"
import "../css/Home.css"

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Verificar si hay un token en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  // Función para manejar las animaciones al hacer scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate")
        }
      })
    }, observerOptions)

    // Observar todos los elementos con la clase 'animate-on-scroll'
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el)
    })

    return () => {
      // Limpiar el observer cuando el componente se desmonte
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        observer.unobserve(el)
      })
    }
  }, [])

  return (
    <div className="home-container">
      {/* Nuevo Hero Section con Carrusel */}
      <HeroSection />

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item animate-on-scroll">
          <span className="stat-number">1000+</span>
          <span className="stat-label">Capacidad Consultas</span>
        </div>
        <div className="stat-item animate-on-scroll">
          <span className="stat-number">50+</span>
          <span className="stat-label">Médicos Especialistas</span>
        </div>
        <div className="stat-item animate-on-scroll">
          <span className="stat-number">98%</span>
          <span className="stat-label">Eficiencia en Atención</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title animate-on-scroll">Nuestros Servicios</h2>
        <div className="features-container">
          <div className="feature animate-on-scroll">
            <div className="feature-icon-container">
              <img src={"/images/consulta-medica.png" || "/placeholder.svg"} alt="Consulta Médica" className="feature-icon" />
            </div>
            <h3 className="feature-title">Consulta Médica Online</h3>
            <p className="feature-description">
              Conecta con médicos especialistas a través del chat o videollamada. Recibe atención médica de calidad sin salir de
              casa.
            </p>
          </div>
          <div className="feature animate-on-scroll">
            <div className="feature-icon-container">
              <img
                src={"/images/especialidades.png"|| "/placeholder.svg"}
                alt="Especialidades Médicas"
                className="feature-icon"
              />
            </div>
            <h3 className="feature-title">Especialidades Médicas</h3>
            <p className="feature-description">
              Accede a una amplia red de especialistas en diferentes áreas: medicina general, pediatría, psicología,
              nutrición y más.
            </p>
          </div>
          <div className="feature animate-on-scroll">
            <div className="feature-icon-container">
              <img src={"/images/historialll.png" || "/placeholder.svg"} alt="Receta Médica" className="feature-icon" />
            </div>
            <h3 className="feature-title">Receta Médica</h3>
            <p className="feature-description">
              Recibe recetas médicas digitales y lleva un seguimiento de tu historial médico de manera segura y
              confidencial.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title animate-on-scroll">¿Cómo Funciona?</h2>
        <div className="steps-container">
          <div className="step animate-on-scroll">
            <div className="step-number">1</div>
            <h3 className="step-title">Regístrate</h3>
            <p className="step-description">Crea tu cuenta en nuestra plataforma de manera rápida y sencilla.</p>
          </div>
          <div className="step animate-on-scroll">
            <div className="step-number">2</div>
            <h3 className="step-title">Elige un Especialista</h3>
            <p className="step-description">
              Navega por nuestro directorio de médicos y selecciona el especialista que necesitas.
            </p>
          </div>
          <div className="step animate-on-scroll">
            <div className="step-number">3</div>
            <h3 className="step-title">Agenda tu Cita</h3>
            <p className="step-description">Selecciona la fecha y hora que mejor se adapte a tu disponibilidad.</p>
          </div>
          <div className="step animate-on-scroll">
            <div className="step-number">4</div>
            <h3 className="step-title">Recibe Atención</h3>
            <p className="step-description">
              Conéctate a la consulta en el horario programado y recibe atención médica personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title animate-on-scroll">Lo que dicen nuestros pacientes</h2>
        <div className="testimonials-container">
          <div className="testimonial animate-on-scroll">
            <div className="testimonial-content">
              <p>
                "Excelente servicio. Pude consultar con un especialista sin tener que salir de casa. La plataforma es
                muy fácil de usar."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <span>MR</span>
              </div>
              <div className="testimonial-info">
                <h4>María Rodríguez</h4>
                <p>Paciente de Medicina General</p>
              </div>
            </div>
          </div>
          <div className="testimonial animate-on-scroll">
            <div className="testimonial-content">
              <p>
                "La consulta online fue muy profesional. El médico me explicó todo detalladamente y recibí mi receta al
                instante."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <span>JL</span>
              </div>
              <div className="testimonial-info">
                <h4>Juan López</h4>
                <p>Paciente de Cardiología</p>
              </div>
            </div>
          </div>
          <div className="testimonial animate-on-scroll">
            <div className="testimonial-content">
              <p>
                "Increíble atención. Pude resolver mi problema de salud rápidamente y sin complicaciones.
                Definitivamente lo recomiendo."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                <span>CP</span>
              </div>
              <div className="testimonial-info">
                <h4>Carolina Pérez</h4>
                <p>Paciente de Nutrición</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reemplazamos la sección de testimonios por la sección para médicos */}
      <MedicosSection />

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="section-title animate-on-scroll">Preguntas Frecuentes</h2>
        <div className="faq-container">
          <div className="faq-item animate-on-scroll">
            <h3 className="faq-question">¿Cómo funciona la consulta online?</h3>
            <p className="faq-answer">
              Las consultas se realizan a través de chat médico/paciente en nuestra plataforma. Solo necesitas un dispositivo
              con conexión a internet y una cámara.
            </p>
          </div>
          <div className="faq-item animate-on-scroll">
            <h3 className="faq-question">¿Es segura la información que comparto?</h3>
            <p className="faq-answer">
              Sí, toda la información compartida en nuestra plataforma está protegida con los más altos estándares de
              seguridad y confidencialidad.
            </p>
          </div>
          <div className="faq-item animate-on-scroll">
            <h3 className="faq-question">¿Puedo cancelar o reprogramar mi cita?</h3>
            <p className="faq-answer">
              Sí, puedes cancelar o reprogramar tu cita hasta 2 horas antes del horario programado sin ningún costo
              adicional.
            </p>
          </div>
          <div className="faq-item animate-on-scroll">
            <h3 className="faq-question">¿Cómo recibo mi receta médica?</h3>
            <p className="faq-answer">
              Las recetas médicas se envían de forma digital a tu correo electrónico al finalizar la consulta y también
              quedan disponibles en la seccion "Mis Consultas" de tu perfil.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-on-scroll">
        <h2 className="cta-title">Comienza a cuidar tu salud hoy mismo</h2>
        <p className="cta-description">
          Accede a atención médica de calidad desde cualquier lugar y en cualquier momento.
        </p>
        <Link to={isAuthenticated ? "/doctores" : "/login"} className="cta-button">
          {isAuthenticated ? "Ver Médicos Disponibles" : "Crear Cuenta"}
        </Link>
      </section>
    </div>
  )
}

export default Home

