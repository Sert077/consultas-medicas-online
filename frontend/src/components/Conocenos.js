"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "../css/Conocenos.css"

const Conocenos = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    email: "",
    telefono: "",
    mensaje: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Enviando solicitud...");

    try {
      const response = await fetch("http://localhost:8000/api/enviar-solicitud-medico/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Solicitud enviada correctamente.");
        setFormData({ nombre: "", especialidad: "", email: "", telefono: "", mensaje: "" });
      } else {
        setMessage("Error al enviar la solicitud: " + data.error);
      }
    } catch (error) {
      setMessage("Error al enviar la solicitud.");
    }
  };
  
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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);
  

  return (
    <div className="conocenos-container">
      {/* Header Section */}
      <section className="conocenos-header">
        <div className="header-content">
          <div className="logo-container animate-on-scroll">
            <img src="/images/logo-conocemas1.png" alt="MediTest Logo" className="conocenos-logo" />
          </div>
          <div className="header-text animate-on-scroll">
            <h1>Conócenos</h1>
            <p>Transformando la atención médica a través de la tecnología</p>
          </div>
        </div>
      </section>

      {/* Quiénes Somos Section */}
      <section className="quienes-somos-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll">Quiénes Somos</h2>
          <div className="quienes-somos-content">
            <div className="quienes-somos-text animate-on-scroll">
              <p>
                <strong>MediTest ©</strong> es una plataforma innovadora de consultas médicas en línea que conecta a
                pacientes con profesionales de la salud de manera rápida, segura y eficiente.
              </p>
              <p>
                Nacimos con el propósito de democratizar el acceso a la salud primeramente desde Cochabamba - Bolivia, eliminando barreras geográficas y
                temporales para que todos puedan recibir atención médica de calidad cuando la necesiten.
              </p>
              <p>
                Nuestro equipo está formado por profesionales apasionados por la tecnología y la salud, comprometidos
                con ofrecer una experiencia excepcional tanto para pacientes como para médicos.
              </p>
            </div>
            <div className="quienes-somos-image animate-on-scroll">
              <img src="/images/equipo-meditest.jpg" alt="Equipo MediTest" />
            </div>
          </div>
        </div>
      </section>

      {/* Nuestra Misión Section */}
      <section className="mision-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll">Nuestra Misión</h2>
          <div className="mision-content">
            <div className="mision-image animate-on-scroll">
              <img src="/images/mision.jpg" alt="Misión MediTest" />
            </div>
            <div className="mision-text animate-on-scroll">
              <p>
                En MediTest, nuestra misión es transformar la manera en que las personas acceden a los servicios de
                salud, haciendo que la atención médica sea:
              </p>
              <ul>
                <li>
                  <strong>Accesible:</strong> Disponible para todos, sin importar su ubicación.
                </li>
                <li>
                  <strong>Conveniente:</strong> Consultas desde la comodidad de tu hogar u oficina.
                </li>
                <li>
                  <strong>Eficiente:</strong> Reduciendo tiempos de espera y procesos burocráticos.
                </li>
                <li>
                  <strong>Personalizada:</strong> Centrada en las necesidades específicas de cada paciente.
                </li>
                <li>
                  <strong>Segura:</strong> Protegiendo la privacidad y confidencialidad de la información médica.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Características Section */}
      <section className="caracteristicas-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll">Características Principales</h2>
          <div className="caracteristicas-grid">
            <div className="caracteristica-card animate-on-scroll">
              <div className="caracteristica-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Consultas Online</h3>
              <p>
                Conecta con médicos especialistas a través de nuestro chat seguro, sin necesidad de desplazamientos.
              </p>
            </div>

            <div className="caracteristica-card animate-on-scroll">
              <div className="caracteristica-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <h3>Especialistas Verificados</h3>
              <p>
                Todos nuestros médicos pasan por un riguroso proceso de verificación para garantizar su credibilidad y
                experiencia.
              </p>
            </div>

            <div className="caracteristica-card animate-on-scroll">
              <div className="caracteristica-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Citas Flexibles</h3>
              <p>Agenda consultas en horarios convenientes para ti, incluso fuera del horario laboral tradicional.</p>
            </div>

            <div className="caracteristica-card animate-on-scroll">
              <div className="caracteristica-icon">
                <i className="fas fa-file-prescription"></i>
              </div>
              <h3>Recetas Digitales</h3>
              <p>Recibe recetas médicas digitales directamente en tu correo electrónico o en tu perfil de usuario.</p>
            </div>

            <div className="caracteristica-card animate-on-scroll">
              <div className="caracteristica-icon">
                <i className="fas fa-history"></i>
              </div>
              <h3>Historial Médico</h3>
              <p>Accede a tu historial de consultas y recomendaciones médicas en cualquier momento desde tu perfil.</p>
            </div>

            <div className="caracteristica-card animate-on-scroll">
              <div className="caracteristica-icon">
                <i className="fas fa-shield"></i>
              </div>
              <h3>Privacidad Garantizada</h3>
              <p>Tu información médica está protegida con los más altos estándares de seguridad y confidencialidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Para Médicos Section */}
      <section id="doctor-form" className="para-medicos-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll">¿Eres Profesional Médico?</h2>
          <div className="para-medicos-content">
            <div className="para-medicos-text animate-on-scroll">
              <h3>Únete a nuestra red de especialistas</h3>
              <p>
                En MediTest, valoramos a los profesionales médicos y les ofrecemos una plataforma para expandir su
                práctica y brindar atención de calidad a más pacientes.
              </p>
              <ul className="beneficios-medicos">
                <li>Flexibilidad para gestionar tu agenda según tu disponibilidad</li>
                <li>Acceso a pacientes de diferentes ubicaciones geográficas</li>
                <li>Herramientas digitales para diagnósticos, recetas y seguimiento</li>
                <li>Facilidad para reprogramar consultas</li>
                <li>Soporte técnico y administrativo continuo</li>
              </ul>
              <p className="contacto-medicos">
                Para unirte a nuestra plataforma, envía tu información profesional a{" "}
                <a href="mailto:servesa07@gmail.com">servesa07@gmail.com</a> o contactanos al{" "}
                <a href="tel:+59168449128">+591 68449128</a>.
              </p>
            </div>
            <div className="para-medicos-form animate-on-scroll">
              <h3>Solicitud de Información</h3>
              <form className="medicos-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo:</label>
                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="especialidad">Especialidad:</label>
                <input type="text" id="especialidad" name="especialidad" value={formData.especialidad} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono:</label>
                <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="mensaje">Mensaje (opcional):</label>
                <textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} rows="4"></textarea>
              </div>
              <button type="submit" className="submit-btn">Enviar Solicitud</button>
            </form>
            {message && <p className="mensaje">{message}</p>}
          </div>
        </div>
      </div>
    </section>

      {/* Contacto Section */}
      <section className="contacto-section">
        <div className="section-container">
          <h2 className="section-title animate-on-scroll">Contáctanos</h2>
          <div className="contacto-content animate-on-scroll">
            <div className="contacto-info">
              <div className="contacto-item">
                <i className="fas fa-envelope"></i>
                <p>
                  Email: <a href="mailto:servesa07@gmail.com">servesa07@gmail.com</a>
                </p>
              </div>
              <div className="contacto-item">
                <i className="fas fa-phone"></i>
                <p>
                  Teléfono: <a href="tel:+59168449128">+591 68449128</a>
                </p>
              </div>
              <div className="contacto-item">
                <i className="fas fa-clock"></i>
                <p>Horario de atención: Lunes a Viernes, 8:00 AM - 8:00 PM</p>
              </div>
              <div className="contacto-social">
                <a href="#" className="social-icon">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-x"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
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
          {isAuthenticated ? "Ver Médicos Disponibles" : "Iniciar Sesión"}
        </Link>
      </section>
    </div>
  )
}

export default Conocenos

