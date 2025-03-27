"use client"

import { useState, useRef, useEffect } from "react"
import * as faceapi from "face-api.js"
import Tesseract from "tesseract.js"
import { FaCamera, FaCheck, FaUpload, FaTimes, FaInfoCircle } from "react-icons/fa"
import "../css/Register.css"

const Register = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [idCard, setIdCard] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [passwordValid, setPasswordValid] = useState(true)
  const [nameError, setNameError] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [birthdateError, setBirthdateError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [usernameError, setUsernameError] = useState("")

  // Estados para imágenes
  const [anverso, setAnverso] = useState(null)
  const [reverso, setReverso] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [anversoPreview, setAnversoPreview] = useState(null)
  const [reversoPreview, setReversoPreview] = useState(null)
  const [selfiePreview, setSelfiePreview] = useState(null)

  // Referencias para los inputs de archivo
  const anversoInputRef = useRef(null)
  const reversoInputRef = useRef(null)
  const selfieInputRef = useRef(null)

  // Estados para validación
  const [faceMatchError, setFaceMatchError] = useState("")
  const [dataMatchError, setDataMatchError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Limpiar las URLs de objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Revocar las URLs de objeto para evitar fugas de memoria
      if (anversoPreview) URL.revokeObjectURL(anversoPreview)
      if (reversoPreview) URL.revokeObjectURL(reversoPreview)
      if (selfiePreview) URL.revokeObjectURL(selfiePreview)
    }
  }, [anversoPreview, reversoPreview, selfiePreview])

  // Manejo de archivos
  const handleFileChange = (setter, previewSetter) => (event) => {
    const file = event.target.files[0]
    if (file) {
      // Revocar la URL anterior si existe
      if (previewSetter === setAnversoPreview && anversoPreview) {
        URL.revokeObjectURL(anversoPreview)
      } else if (previewSetter === setReversoPreview && reversoPreview) {
        URL.revokeObjectURL(reversoPreview)
      } else if (previewSetter === setSelfiePreview && selfiePreview) {
        URL.revokeObjectURL(selfiePreview)
      }

      // Crear nueva URL y actualizar estados
      const objectUrl = URL.createObjectURL(file)
      setter(file)
      previewSetter(objectUrl)

      // Resetear el input para permitir seleccionar el mismo archivo nuevamente
      event.target.value = null
    }
  }

  // Función para eliminar imagen
  const handleRemoveImage = (setter, previewSetter) => {
    // Revocar la URL si existe
    if (previewSetter === setAnversoPreview && anversoPreview) {
      URL.revokeObjectURL(anversoPreview)
    } else if (previewSetter === setReversoPreview && reversoPreview) {
      URL.revokeObjectURL(reversoPreview)
    } else if (previewSetter === setSelfiePreview && selfiePreview) {
      URL.revokeObjectURL(selfiePreview)
    }

    // Limpiar los estados
    setter(null)
    previewSetter(null)

    // Resetear el input correspondiente
    if (previewSetter === setAnversoPreview && anversoInputRef.current) {
      anversoInputRef.current.value = null
    } else if (previewSetter === setReversoPreview && reversoInputRef.current) {
      reversoInputRef.current.value = null
    } else if (previewSetter === setSelfiePreview && selfieInputRef.current) {
      selfieInputRef.current.value = null
    }
  }

  // Función para abrir la cámara
const openCamera = (inputRef, captureMode) => {
    if (inputRef.current) {
      inputRef.current.setAttribute("capture", captureMode) // 'environment' para trasera, 'user' para frontal
      inputRef.current.click()
    }
  }
  
  // 📌 Función para preprocesar imágenes
  const preprocessImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = () => {
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
  
          canvas.width = img.width;
          canvas.height = img.height;
  
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
            // Convertir a escala de grises
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg; // red
              data[i + 1] = avg; // green
              data[i + 2] = avg; // blue
            }
            ctx.putImageData(imageData, 0, 0);
  
            resolve(canvas);
          } else {
            reject(new Error("Error al procesar la imagen."));
          }
        };
      };
  
      reader.readAsDataURL(file);
    });
  };

  // 📌 Función para preprocesar imágenes
  const alternativePreprocessImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = () => {
        img.src = reader.result
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          canvas.width = img.width
          canvas.height = img.height

          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas)
          } else {
            reject(new Error("Error al procesar la imagen."))
          }
        }
      }

      reader.readAsDataURL(file)
    })
  }

  // 📌 Función para verificar el rostro
  const verifyFace = async () => {
    if (!selfie || !anverso) {
      setFaceMatchError("Debes subir una selfie y la foto del anverso de la cédula.")
      return false
    }

    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models")
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models")

    const anversoCanvas = await preprocessImage(anverso)
    const selfieImage = await faceapi.bufferToImage(selfie)

    const selfieDetection = await faceapi.detectSingleFace(selfieImage).withFaceLandmarks().withFaceDescriptor()
    const anversoDetection = await faceapi.detectSingleFace(anversoCanvas).withFaceLandmarks().withFaceDescriptor()

    if (!selfieDetection || !anversoDetection) {
      setFaceMatchError("No se detectó un rostro en una o ambas imágenes.")
      return false
    }

    const distance = faceapi.euclideanDistance(selfieDetection.descriptor, anversoDetection.descriptor)
    const isMatch = distance < 0.6

    if (!isMatch) {
      setFaceMatchError("El rostro no coincide entre la selfie y la cédula.")
      return false
    }

    return true
  }

  const verifyText = async () => {
    if (!reverso || !anverso) {
      setDataMatchError("Debes subir ambas fotos de la cédula.");
      return false;
    }
  
    const tryWithAlternativePreprocess = async () => {
      try {
        const anversoCanvas = await alternativePreprocessImage(anverso);
        const reversoCanvas = await alternativePreprocessImage(reverso);
  
        const anversoDataUrl = anversoCanvas.toDataURL();
        const reversoDataUrl = reversoCanvas.toDataURL();
  
        const [anversoResult, reversoResult] = await Promise.all([
          Tesseract.recognize(anversoDataUrl, "spa"),
          Tesseract.recognize(reversoDataUrl, "spa"),
        ]);
  
        const anversoText = anversoResult.data.text;
        const reversoText = reversoResult.data.text;
  
        // Verificar el número de cédula
        const ciRegex = /No\.?\s*([0-9]+)/i;
        const ciMatch = anversoText.match(ciRegex);
  
        if (!ciMatch || !ciMatch[1]) {
          setDataMatchError("No se pudo detectar el número de cédula en la imagen.");
          return false;
        }
  
        const extractedCi = ciMatch[1].trim();
  
        if (extractedCi !== idCard.trim()) {
          setDataMatchError("El número de cédula no coincide.");
          return false;
        }
  
        // Verificar nombre y apellidos
        if (
          !reversoText.toLowerCase().includes(firstName.toLowerCase()) ||
          !reversoText.toLowerCase().includes(lastName.toLowerCase())
        ) {
          setDataMatchError("El nombre o apellidos no coinciden.");
          return false;
        }
  
        // Verificar fecha de nacimiento
        const dobRegex = /Nacido el (\d{1,2}) de ([a-zA-Z]+) de (\d{4})/i;
        const dobMatch = reversoText.match(dobRegex);
  
        if (dobMatch) {
          const [, day, month, year] = dobMatch;
          const monthMap = {
            enero: "01",
            febrero: "02",
            marzo: "03",
            abril: "04",
            mayo: "05",
            junio: "06",
            julio: "07",
            agosto: "08",
            septiembre: "09",
            octubre: "10",
            noviembre: "11",
            diciembre: "12",
          };
  
          const extractedDob = `${year}-${monthMap[month.toLowerCase()]}-${day.padStart(2, "0")}`;
  
          if (extractedDob !== birthdate) {
            setDataMatchError("La fecha de nacimiento no coincide.");
            return false;
          }
        } else {
          setDataMatchError("No se pudo leer la fecha de nacimiento.");
          return false;
        }
  
        return true;
      } catch (error) {
        console.error("Error al procesar la cédula con preprocesamiento alternativo:", error);
        return false;
      }
    };
  
    try {
      const anversoCanvas = await preprocessImage(anverso);
      const reversoCanvas = await preprocessImage(reverso);
  
      const anversoDataUrl = anversoCanvas.toDataURL();
      const reversoDataUrl = reversoCanvas.toDataURL();
  
      const [anversoResult, reversoResult] = await Promise.all([
        Tesseract.recognize(anversoDataUrl, "spa"),
        Tesseract.recognize(reversoDataUrl, "spa"),
      ]);
  
      const anversoText = anversoResult.data.text;
      const reversoText = reversoResult.data.text;
  
      // Verificar el número de cédula
      const ciRegex = /No\.?\s*([0-9]+)/i;
      const ciMatch = anversoText.match(ciRegex);
  
      if (!ciMatch || !ciMatch[1]) {
        setDataMatchError("No se pudo detectar el número de cédula en la imagen.");
        return false;
      }
  
      const extractedCi = ciMatch[1].trim();
  
      if (extractedCi !== idCard.trim()) {
        setDataMatchError("El número de cédula no coincide.");
        return false;
      }
  
      // Verificar nombre y apellidos
      if (
        !reversoText.toLowerCase().includes(firstName.toLowerCase()) ||
        !reversoText.toLowerCase().includes(lastName.toLowerCase())
      ) {
        setDataMatchError("El nombre o apellidos no coinciden.");
        return false;
      }
  
      // Verificar fecha de nacimiento
      const dobRegex = /Nacido el (\d{1,2}) de ([a-zA-Z]+) de (\d{4})/i;
      const dobMatch = reversoText.match(dobRegex);
  
      if (dobMatch) {
        const [, day, month, year] = dobMatch;
        const monthMap = {
          enero: "01",
          febrero: "02",
          marzo: "03",
          abril: "04",
          mayo: "05",
          junio: "06",
          julio: "07",
          agosto: "08",
          septiembre: "09",
          octubre: "10",
          noviembre: "11",
          diciembre: "12",
        };
  
        const extractedDob = `${year}-${monthMap[month.toLowerCase()]}-${day.padStart(2, "0")}`;
  
        if (extractedDob !== birthdate) {
          setDataMatchError("La fecha de nacimiento no coincide.");
          return false;
        }
      } else {
        // Si no se puede leer la fecha de nacimiento, intentar con el preprocesamiento alternativo
        return await tryWithAlternativePreprocess();
      }
  
      return true;
    } catch (error) {
      console.error("Error al procesar la cédula:", error);
      return await tryWithAlternativePreprocess();
    }
  };

  // 📌 Función para iniciar verificación
  const handleVerification = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setFaceMatchError("")
    setDataMatchError("")

    const faceVerified = await verifyFace()
    const dataVerified = await verifyText()

    if (faceVerified && dataVerified) {
      setIsVerified(true)
      setSuccessMessage("¡Verificación exitosa! \n Tus datos han sido validados correctamente.")
      setShowSuccessMessage(true)

      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }

    setIsVerifying(false)
  }

  const validateBirthdate = (birthdate) => {
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear(); // Cambiar const por let
  
    const month = today.getMonth() - birthDateObj.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
      age--; // Ahora sí se puede modificar
    }
  
    return age >= 0 && age <= 125;
  };
  

  const handleNameChange = (e) => {
    const value = e.target.value
    setFirstName(value)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      setNameError("Solo se permiten caracteres alfabéticos")
    } else {
      setNameError("")
    }
  }

  const handleLastNameChange = (e) => {
    const value = e.target.value
    setLastName(value)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      setLastNameError("Solo se permiten caracteres alfabéticos")
    } else {
      setLastNameError("")
    }
  }

  const handleBirthdateChange = (e) => {
    setBirthdate(e.target.value)
    if (!validateBirthdate(e.target.value)) {
      setBirthdateError("La edad debe estar entre 0 y 125 años.")
    } else {
      setBirthdateError("")
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    setPhoneNumber(value)
    if (!/^\d*$/.test(value)) {
      setPhoneError("Solo se permiten caracteres numéricos")
    } else {
      setPhoneError("")
    }
  }

  const handleIdCardChange = (e) => {
    setIdCard(e.target.value)
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)

    // Validar la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    setPasswordValid(passwordRegex.test(value))
  }

  const handleRepeatPasswordChange = (e) => {
    setRepeatPassword(e.target.value)
    setPasswordsMatch(password === e.target.value)
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    setEmailError("")
    setUsernameError("")

    if (!validateBirthdate(birthdate)) {
      alert("Por favor, corrige la fecha de nacimiento antes de continuar.")
      return
    }

    if (!passwordValid) {
      alert("La contraseña no cumple con los requisitos.")
      return
    }

    if (!passwordsMatch) {
      alert("Las contraseñas no coinciden")
      return
    }

    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)
    formData.append("first_name", firstName)
    formData.append("last_name", lastName)
    formData.append("email", email)
    formData.append("perfil.tipo_usuario", "paciente")
    formData.append("perfil.birthdate", birthdate)
    formData.append("perfil.phone_number", phoneNumber)
    formData.append("perfil.id_card", idCard)

    // Usar la selfie como foto de perfil
    if (selfie) {
      formData.append("perfil.user_picture", selfie)
    }

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("Registro exitoso, Por favor revisa tu correo electrónico para verificar tu cuenta.")
      } else {
        const errorData = await response.json()
        if (errorData.email) setEmailError(errorData.email[0])
        if (errorData.username) setUsernameError(errorData.username[0])
      }
    } catch (error) {
      console.error("Error de red:", error)
      alert("Error de red al registrarse")
    }
  }

  return (
    <div className="register-container">
      <h2>Registro de Paciente</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Nombre(s):<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            value={firstName}
            onChange={handleNameChange}
            placeholder="Ingrese su nombre"
            required
            pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
            maxLength="20"
            onInvalid={(e) => e.target.setCustomValidity("Solo se permiten caracteres alfabeticos")}
            onInput={(e) => e.target.setCustomValidity("")}
            disabled={isVerified}
            className={isVerified ? "verified-field" : ""}
          />
          {nameError && <div style={{ color: "red", fontSize: "12px" }}>{nameError}</div>}
          {isVerified && (
            <div className="verified-field-info">
              <FaInfoCircle /> Campo verificado, no se puede editar
            </div>
          )}
        </div>
        <div>
          <label>Apellidos:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            value={lastName}
            onChange={handleLastNameChange}
            placeholder="Ingrese sus apellidos"
            required
            pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$"
            maxLength="20"
            onInvalid={(e) => e.target.setCustomValidity("Solo se permiten caracteres alfabeticos")}
            onInput={(e) => e.target.setCustomValidity("")}
            disabled={isVerified}
            className={isVerified ? "verified-field" : ""}
          />
          {lastNameError && <div style={{ color: "red", fontSize: "12px" }}>{lastNameError}</div>}
          {isVerified && (
            <div className="verified-field-info">
              <FaInfoCircle /> Campo verificado, no se puede editar
            </div>
          )}
        </div>
        <div>
          <label>Fecha de nacimiento:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="date"
            value={birthdate}
            onChange={handleBirthdateChange}
            required
            max={new Date().toISOString().split("T")[0]} // Fecha máxima: hoy
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 125)).toISOString().split("T")[0]} // Fecha mínima: hace 125 años
            disabled={isVerified}
            className={isVerified ? "verified-field" : ""}
          />
          {birthdateError && <div style={{ color: "red", fontSize: "12px" }}>{birthdateError}</div>}
          {isVerified && (
            <div className="verified-field-info">
              <FaInfoCircle /> Campo verificado, no se puede editar
            </div>
          )}
        </div>

        <div>
          <label>Cédula de Identidad:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            value={idCard}
            onChange={handleIdCardChange}
            placeholder="Ingrese su cédula de identidad"
            required
            maxLength="20"
            disabled={isVerified}
            className={isVerified ? "verified-field" : ""}
          />
          {isVerified && (
            <div className="verified-field-info">
              <FaInfoCircle /> Campo verificado, no se puede editar
            </div>
          )}
        </div>

        <div>
          <label>Número telefónico:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Ingrese su número de teléfono"
            required
            pattern="^\d+$"
            maxLength="9"
            onInvalid={(e) => e.target.setCustomValidity("Solo se permiten caracteres numéricos")}
            onInput={(e) => e.target.setCustomValidity("")}
          />
          {phoneError && <div style={{ color: "red", fontSize: "12px" }}>{phoneError}</div>}
        </div>
        
        <div>
          <label>Nombre de Usuario:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingrese un nombre de usuario"
            required
            maxLength="25"
          />
          {usernameError && <div style={{ color: "red", fontSize: "12px" }}>{usernameError}</div>}
        </div>
        <div>
          <label>Email:<span style={{ color: 'red' }}> *</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su correo electrónico"
            required
            maxLength="200"
          />
          {emailError && <div style={{ color: "red", fontSize: "12px" }}>{emailError}</div>}
        </div>
        <div>
          <label>Contraseña:<span style={{ color: 'red' }}> *</span></label>
          <div className="password-input">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Ingrese su contraseña"
              required
            />
            <span className="show-password-icon" onClick={() => setShowPassword(!showPassword)}>
              <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
            </span>
          </div>
          {!passwordValid && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "5px"}}>
              La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.
            </div>
          )}
        </div>
        <div>
          <label>Repetir Contraseña:<span style={{ color: 'red' }}> *</span></label>
          <div className="password-input">
            <input
              type={showRepeatPassword ? "text" : "password"}
              value={repeatPassword}
              onChange={handleRepeatPasswordChange}
              placeholder="Repita su contraseña"
              required
              style={{
                borderColor: repeatPassword && !passwordsMatch ? "red" : "",
              }}
            />
            <span className="show-password-icon" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
              <i className={showRepeatPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
            </span>
          </div>
          {repeatPassword && !passwordsMatch && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>Las contraseñas no coinciden.</div>
          )}
        </div>

        <div className="verification-section">
          <h3>Verificación de Identidad</h3>
          <p className="verification-info">
            Para verificar tu identidad, necesitamos que subas fotos del anverso y reverso de tu cédula de identidad,
            así como una selfie. Estas imágenes serán utilizadas únicamente para verificar tu identidad.
          </p>

          <div className="id-images-container">
            {/* Anverso */}
            <div className="id-image-upload">
              <label>Anverso de la Cédula:</label>
              <div className="id-image-input-container">
                <input
                  type="file"
                  ref={anversoInputRef}
                  onChange={handleFileChange(setAnverso, setAnversoPreview)}
                  accept="image/*"
                  className="id-file-input"
                  disabled={isVerified}
                />

                {anversoPreview ? (
                  <div className="id-image-preview-container">
                    <img
                      src={anversoPreview || "/placeholder.svg"}
                      alt="Anverso de la cédula"
                      className="id-image-preview"
                    />
                    {!isVerified && (
                      <button
                        type="button"
                        className="id-image-remove-btn"
                        onClick={() => handleRemoveImage(setAnverso, setAnversoPreview)}
                      >
                        <FaTimes size={24} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="id-image-buttons">
                    <button
                      type="button"
                      className="id-image-upload-btn"
                      onClick={() => anversoInputRef.current.click()}
                      disabled={isVerified}
                    >
                      <FaUpload /> Subir Imagen
                    </button>
                    <button
                      type="button"
                      className="id-image-camera-btn"
                      onClick={() => openCamera(anversoInputRef)}
                      disabled={isVerified}
                    >
                      <FaCamera /> Usar Cámara
                    </button>
                    <div className="selfie-info">
                      <FaInfoCircle /> Por favor no use filtros en las imágenes de la cédula
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reverso */}
            <div className="id-image-upload">
              <label>Reverso de la Cédula:</label>
              <div className="id-image-input-container">
                <input
                  type="file"
                  ref={reversoInputRef}
                  onChange={handleFileChange(setReverso, setReversoPreview)}
                  accept="image/*"
                  className="id-file-input"
                  disabled={isVerified}
                />

                {reversoPreview ? (
                  <div className="id-image-preview-container">
                    <img
                      src={reversoPreview || "/placeholder.svg"}
                      alt="Reverso de la cédula"
                      className="id-image-preview"
                    />
                    {!isVerified && (
                      <button
                        type="button"
                        className="id-image-remove-btn"
                        onClick={() => handleRemoveImage(setReverso, setReversoPreview)}
                      >
                        <FaTimes size={24} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="id-image-buttons">
                    <button
                      type="button"
                      className="id-image-upload-btn"
                      onClick={() => reversoInputRef.current.click()}
                      disabled={isVerified}
                    >
                      <FaUpload /> Subir Imagen
                    </button>
                    <button
                      type="button"
                      className="id-image-camera-btn"
                      onClick={() => openCamera(reversoInputRef)}
                      disabled={isVerified}
                    >
                      <FaCamera /> Usar Cámara
                    </button>
                    <div className="selfie-info">
                      <FaInfoCircle /> Por favor no use filtros en las imágenes de la cédula 
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selfie */}
            <div className="id-image-upload">
              <label>Selfie:</label>
              <div className="id-image-input-container">
                <input
                  type="file"
                  ref={selfieInputRef}
                  onChange={handleFileChange(setSelfie, setSelfiePreview)}
                  accept="image/*"
                  className="id-file-input"
                  disabled={isVerified}
                />

                {selfiePreview ? (
                  <div className="id-image-preview-container">
                    <img src={selfiePreview || "/placeholder.svg"} alt="Selfie" className="id-image-preview" />
                    {!isVerified && (
                      <button
                        type="button"
                        className="id-image-remove-btn"
                        onClick={() => handleRemoveImage(setSelfie, setSelfiePreview)}
                      >
                        <FaTimes size={24} />
                      </button>
                    )}
                    <div className="selfie-info">
                      <FaInfoCircle /> Esta imagen se usará como tu foto de perfil
                    </div>
                  </div>
                ) : (
                  <div className="id-image-buttons">
                    <button
                      type="button"
                      className="id-image-upload-btn"
                      onClick={() => selfieInputRef.current.click()}
                      disabled={isVerified}
                    >
                      <FaUpload /> Subir Imagen
                    </button>
                    <button
                      type="button"
                      className="id-image-camera-btn"
                      onClick={() => openCamera(selfieInputRef)}
                      disabled={isVerified}
                    >
                      <FaCamera /> Usar Cámara
                    </button>
                    <div className="selfie-info">
                      <FaInfoCircle /> Esta imagen se usará como tu foto de perfil
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="verification-actions">
            <button
              type="button"
              className="verify-button"
              onClick={handleVerification}
              disabled={isVerifying || !anverso || !reverso || !selfie || isVerified}
            >
              {isVerifying ? (
                "Verificando..."
              ) : isVerified ? (
                <>
                  <FaCheck /> Verificado
                </>
              ) : (
                "Verificar Identidad"
              )}
            </button>
          </div>

          {faceMatchError && <div className="verification-error">{faceMatchError}</div>}
          {dataMatchError && <div className="verification-error">{dataMatchError}</div>}
        </div>

        <button type="submit" className="register-button" disabled={!isVerified}>
          Registrar
        </button>
      </form>

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="success-message-overlay">
          <div className="success-message-content">
            <p>{successMessage}</p>
            <button onClick={() => setShowSuccessMessage(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register

