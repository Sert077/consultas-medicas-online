"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import "../css/HeroSection.css"

// Imágenes para el carrusel (reemplaza estas URLs con tus propias imágenes)
const carouselImages = [
  "/images/doctor-image.jpg",
  "/images/doctor-image2.jpg", // Añade más imágenes
  "/images/doctor-image3.jpg",
]

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0)

  // Cambiar imagen automáticamente cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Función para cambiar a la imagen anterior
  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))
  }

  // Función para cambiar a la siguiente imagen
  const nextImage = () => {
    setCurrentImage((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="hero-section">
      <div className="hero-carousel">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentImage ? "active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        {/* Controles del carrusel */}
        <button className="carousel-control prev" onClick={prevImage}>
          <span>&#10094;</span>
        </button>
        <button className="carousel-control next" onClick={nextImage}>
          <span>&#10095;</span>
        </button>

        {/* Indicadores */}
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImage ? "active" : ""}`}
              onClick={() => setCurrentImage(index)}
            />
          ))}
        </div>
      </div>

      <div className="hero-overlay">
        <div className="hero-content animate-on-scroll">
          <h1 className="hero-title">Meditest, Consultas Médicas Online</h1>
          <p className="hero-subtitle">Atención médica de calidad desde la comodidad de tu hogar</p>
          <div className="hero-buttons">
            <Link to="/doctores" className="hero-button primary">
              Ver Médicos
            </Link>
            <Link to="/consultas" className="hero-button secondary">
              Reservar Consulta
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

