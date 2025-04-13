import { useEffect } from "react"
import { Shield, Lock, FileText, UserCheck, Database, Bell, Eye, Mail } from "lucide-react"
import "../css/PoliticaPrivacidad.css"

const PoliticaPrivacidad = () => {
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

  // Función para manejar el scroll a secciones
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="privacy-container">
      {/* Header Section */}
      <section className="privacy-header">
        <div className="header-content">
          
          <div className="header-text">
            <h1>Política de Privacidad</h1>
            <p>
              En MediTest, protegemos tu información personal y médica con altos estándares de seguridad y
              confidencialidad.
            </p>
          </div>
        </div>
      </section>

      {/* Tabla de Contenidos */}
      <section className="privacy-toc">
        <div className="section-container">
          <div className="toc-card">
            <h2>Contenido</h2>
            <ul className="toc-list">
              
              <li onClick={() => scrollToSection("datos-recopilados")}>1. Datos que recopilamos</li>
              <li onClick={() => scrollToSection("base-legal")}>2. Base legal para el tratamiento</li>
              <li onClick={() => scrollToSection("finalidad")}>3. Finalidad del tratamiento</li>
              <li onClick={() => scrollToSection("derechos")}>4. Derechos del usuario</li>
              <li onClick={() => scrollToSection("conservacion")}>5. Conservación de datos</li>
              <li onClick={() => scrollToSection("seguridad")}>6. Medidas de seguridad</li>
              {/*<li onClick={() => scrollToSection("menores")}>8. Menores de edad</li>*/}
              <li onClick={() => scrollToSection("cambios")}>7. Cambios en la política</li>
              <li onClick={() => scrollToSection("contacto")}>8. Contacto</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="privacy-content">
        <div className="section-container">
          {/* Introducción */}
          <div id="introduccion" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <Shield size={40} />
            </div>
            <h2 className="section-title">Introducción</h2>
            <div className="privacy-text">
              <p>
                En MediTest nos se compromete a proteger y respetar su privacidad. Esta Política
                de Privacidad establece la base sobre la cual procesamos cualquier dato personal que recopilamos de
                usted o que nos proporciona a través de nuestra plataforma de consultas médicas online.
              </p>
              <p>
                Nuestra plataforma cumple con el Reglamento General de Protección de Datos (GDPR) y otras leyes de
                protección de datos aplicables. Le recomendamos leer detenidamente esta política para entender nuestras
                prácticas con respecto a sus datos personales.
              </p>
            </div>
          </div>

          {/* Datos Recopilados */}
          <div id="datos-recopilados" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <Database size={40} />
            </div>
            <h2 className="section-title">1. Datos que recopilamos</h2>
            <div className="privacy-text">
              <h3>1.1 Información de identificación personal</h3>
              <ul>
                <li>Nombre completo</li>
                <li>Fecha de nacimiento</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Documento de identidad</li>
                <li>Fotografía (para verificación de identidad)</li>
              </ul>

              <h3>1.2 Información médica</h3>
              <ul>
                <li>Historial médico</li>
                <li>Síntomas y condiciones de salud</li>
                <li>Medicamentos</li>
                <li>Alergias</li>
                <li>Resultados de pruebas médicas (si los proporciona)</li>
              </ul>

              <p>
                <strong>Nota importante:</strong> La información médica se considera una categoría especial de datos
                personales bajo el GDPR y recibe protecciones adicionales como noramtiva HIPAA.
              </p>
            </div>
          </div>

          {/* Base Legal */}
          <div id="base-legal" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <FileText size={40} />
            </div>
            <h2 className="section-title">2. Base legal para el tratamiento</h2>
            <div className="privacy-text">
              <p>Procesamos sus datos personales en las siguientes bases legales:</p>

              <ul>
                <li>
                  <strong>Consentimiento:</strong> Cuando ha dado su consentimiento explícito para el procesamiento de
                  sus datos personales para uno o más propósitos específicos.
                </li>
                <li>
                  <strong>Intereses legítimos:</strong> Cuando el procesamiento es necesario para nuestros intereses
                  legítimos o los de un tercero, excepto cuando dichos intereses son anulados por sus intereses o
                  derechos y libertades fundamentales.
                </li>
                <li>
                  <strong>Obligación legal:</strong> Cuando el procesamiento es necesario para cumplir con una
                  obligación legal a la que estamos sujetos.
                </li>
              </ul>

              <p>
                Para el procesamiento de categorías especiales de datos personales (como información médica), nos
                basamos en su consentimiento explícito y/o cuando el procesamiento es necesario para fines de medicina
                preventiva o ocupacional, diagnóstico médico o tratamiento.
              </p>
            </div>
          </div>

          {/* Finalidad */}
          <div id="finalidad" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <UserCheck size={40} />
            </div>
            <h2 className="section-title">3. Finalidad del tratamiento</h2>
            <div className="privacy-text">
              <p>Utilizamos sus datos personales para los siguientes fines:</p>

              <ul>
                <li>Proporcionar y gestionar nuestros servicios de consulta médica online</li>
                <li>Facilitar la comunicación entre pacientes y profesionales médicos</li>
                <li>Gestionar su cuenta y perfil de usuario</li>
                <li>Enviar notificaciones relacionadas con su atención médica</li>
                <li>Mejorar y personalizar nuestros servicios</li>
                <li>Prevenir fraudes y garantizar la seguridad de nuestra plataforma</li>
                <li>Enviar comunicaciones de marketing (solo con su consentimiento explícito)</li>
              </ul>

              <p>
                No utilizaremos sus datos personales para fines distintos a aquellos para los que fueron recopilados, a
                menos que obtengamos su consentimiento o estemos obligados o autorizados por ley.
              </p>
            </div>
          </div>

          {/* Derechos */}
          <div id="derechos" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <Lock size={40} />
            </div>
            <h2 className="section-title">4. Derechos del usuario</h2>
            <div className="privacy-text">
              <p>Bajo la normativa GDPR (General Data Protection Regulation) usted tiene los siguientes derechos:</p>

              <div className="rights-grid">
                <div className="right-card">
                  <h3>Derecho de acceso</h3>
                  <p>
                    Derecho a obtener confirmación sobre si estamos procesando sus datos personales y a acceder a dichos
                    datos.
                  </p>
                </div>

                <div className="right-card">
                  <h3>Derecho de rectificación</h3>
                  <p>Derecho a solicitar la corrección de datos personales inexactos o incompletos.</p>
                </div>

                <div className="right-card">
                  <h3>Derecho de supresión</h3>
                  <p>Derecho a solicitar la eliminación de sus datos personales en determinadas circunstancias.</p>
                </div>

                <div className="right-card">
                  <h3>Derecho a la limitación</h3>
                  <p>Derecho a solicitar la restricción del procesamiento de sus datos personales.</p>
                </div>

                <div className="right-card">
                  <h3>Derecho a la portabilidad</h3>
                  <p>
                    Derecho a recibir sus datos personales en un formato estructurado y a transmitirlos a otro
                    responsable.
                  </p>
                </div>

                <div className="right-card">
                  <h3>Derecho de oposición</h3>
                  <p>Derecho a oponerse al procesamiento de sus datos personales en determinadas circunstancias.</p>
                </div>
              </div>

              <p>
                Para ejercer cualquiera de estos derechos, puede contactarnos a través de los medios indicados en la
                sección "Contacto". Responderemos a su solicitud dentro de un mes, aunque este período puede extenderse
                en casos complejos.
              </p>

              <p>
                También tiene derecho a presentar una reclamación ante una autoridad de control si considera que el
                procesamiento de sus datos personales infringe las leyes de protección de datos.
              </p>
            </div>
          </div>

          {/* Conservación */}
          <div id="conservacion" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <Bell size={40} />
            </div>
            <h2 className="section-title">5. Conservación de datos</h2>
            <div className="privacy-text">
              <p>
                Conservaremos sus datos personales solo durante el tiempo necesario para cumplir con los fines para los
                que fueron recopilados, incluido el cumplimiento de requisitos legales, contables o de informes.
              </p>

              <p>
                Para determinar el período de retención apropiado, consideramos la cantidad, naturaleza y sensibilidad
                de los datos personales, el riesgo potencial de daño por uso o divulgación no autorizados, los fines
                para los que procesamos sus datos y si podemos lograr esos fines a través de otros medios.
              </p>

              <p>
                En el caso de datos médicos y de salud, estos se conservarán de acuerdo con la normativa HIPAA a los registros médicos, que generalmente requieren un período de retención más largo debido
                a su naturaleza.
              </p>

              <p>Cuando ya no necesitemos sus datos personales, los eliminaremos o anonimizaremos de manera segura.</p>
            </div>
          </div>

          {/* Seguridad */}
          <div id="seguridad" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <Eye size={40} />
            </div>
            <h2 className="section-title">6. Medidas de seguridad</h2>
            <div className="privacy-text">
              <p>
                Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra el
                procesamiento no autorizado usando normativas HIPAA.
              </p>

              <p>Estas medidas incluyen:</p>

              <ul>
                <li>Encriptación de datos sensibles mediante el protocolo AES-256</li>
                <li>Controles de acceso restringido a datos personales</li>
                <li>Autenticación de identidad para el registro de pacientes</li>
                <li>Políticas y procedimientos de seguridad de la información</li>
              </ul>

              <p>
                Aunque nos esforzamos por proteger sus datos personales, ninguna transmisión por Internet o método de
                almacenamiento electrónico es 100% seguro. Por lo tanto, no podemos garantizar su seguridad absoluta.
              </p>
            </div>
          </div>

          {/* Menores */}
          {/* <div id="menores" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <UserCheck size={40} />
            </div>
            <h2 className="section-title">8. Menores de edad</h2>
            <div className="privacy-text">
              <p>
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos a sabiendas datos
                personales de menores de 18 años sin el consentimiento verificable de un padre o tutor legal.
              </p>

              <p>
                Si es padre o tutor y cree que su hijo nos ha proporcionado datos personales sin su consentimiento,
                contáctenos. Si descubrimos que hemos recopilado datos personales de un menor sin verificación del
                consentimiento parental, tomaremos medidas para eliminar esa información de nuestros servidores.
              </p>

              <p>
                En el caso de servicios médicos para menores, estos solo se proporcionarán con el consentimiento
                explícito de los padres o tutores legales, quienes deberán estar presentes durante la consulta.
              </p>
            </div>
          </div>*/}

          {/* Cambios */}
          <div id="cambios" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <FileText size={40} />
            </div>
            <h2 className="section-title">7. Cambios en la política</h2>
            <div className="privacy-text">
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras
                prácticas o por otros motivos operativos, legales o regulatorios.
              </p>

              <p>
                Le notificaremos cualquier cambio material publicando la nueva Política de Privacidad en nuestra
                plataforma y, cuando sea apropiado, le informaremos por correo electrónico u otros medios.
              </p>

              <p>
                Le recomendamos revisar esta Política de Privacidad periódicamente para estar informado sobre cómo
                protegemos su información.
              </p>

              <p>La fecha de la última actualización se indicará al final de esta política.</p>
            </div>
          </div>

          {/* Contacto */}
          <div id="contacto" className="privacy-section animate-on-scroll">
            <div className="section-icon">
              <Mail size={40} />
            </div>
            <h2 className="section-title">8. Contacto</h2>
            <div className="privacy-text">
              <p>
                Si tiene alguna pregunta sobre esta Política de Privacidad o sobre cómo tratamos sus datos personales 
                puede contactarnos a través de:
              </p>

              <div className="contact-info">
                <p>
                  <strong>Correo electrónico:</strong> <a href="mailto:servesa07@gmail.com">servesa07@gmail.com</a>
                </p>
                <p>
                  <strong>Teléfono:</strong> +591 68449128
                </p>
              </div>

              <p>
                Nos comprometemos a responder a sus consultas y solicitudes dentro de un plazo razonable y de acuerdo
                con las leyes aplicables.
              </p>
            </div>
          </div>

          <div className="privacy-footer animate-on-scroll">
            <p>Última actualización: Abril 2025</p>
            <p>© 2025 MediTest. Todos los derechos reservados.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PoliticaPrivacidad