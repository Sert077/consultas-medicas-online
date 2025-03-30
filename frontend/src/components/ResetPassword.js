
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../css/ResetPassword.css"

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { uid, token } = useParams()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validar longitud mínima
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/patient/reset-password-confirm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/")
        }, 3000)
      } else {
        setError(data.error || "Error al restablecer la contraseña")
      }
    } catch (error) {
      setError("Error de conexión. Inténtalo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2>Restablecer Contraseña</h2>
        </div>

        {success ? (
          <div className="reset-success">
            <i className="fas fa-check-circle"></i>
            <p>Tu contraseña ha sido restablecida con éxito.</p>
            <p>Serás redirigido a la página de inicio en unos segundos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="new-password">
                <i className="fas fa-lock"></i> Nueva Contraseña
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                <i className="fas fa-lock"></i> Confirmar Contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            {error && (
              <div className="reset-error">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button type="submit" className="reset-button" disabled={loading}>
              {loading ? <span>Procesando...</span> : <span>Restablecer Contraseña</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

