import React, { useState, useRef } from "react";
import "../css/meditest-logo.css"; // Estilos CSS separados

// Componente de icono de descarga simple
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );
  
  export default function MediTestLogoOptions() {
    const [selectedLogo, setSelectedLogo] = useState("1");
    const [size, setSize] = useState(200);
    const [background, setBackground] = useState("transparent");
    const [logoColor, setLogoColor] = useState("original");
    
    // Function to handle download with selected background and color
    const handleDownload = (format) => {
      const svgElement = document.getElementById(`meditest-logo-${selectedLogo}`);
      if (!svgElement) return;
      
      // Create a clone of the SVG to modify for download
      const svgClone = svgElement.cloneNode(true);
      
      // If background is not transparent, add a background rectangle
      if (background !== "transparent") {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", background);
        svgClone.insertBefore(rect, svgClone.firstChild);
      }
      
      // Get the SVG as a string
      const svgData = new XMLSerializer().serializeToString(svgClone);
      
      if (format === "svg") {
        // Download as SVG
        const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `meditest-logo-${selectedLogo}-${logoColor}-${background}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === "png") {
        // Download as PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = size;
        canvas.height = size;
        
        const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
        const img = new Image();
        img.src = svgUrl;
        
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngUrl = canvas.toDataURL("image/png");
          
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `meditest-logo-${selectedLogo}-${logoColor}-${background}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        
        img.crossOrigin = "anonymous";
      }
    };
  
    // Get colors based on selected color scheme
    const getColors = () => {
      if (logoColor === "white") {
        return {
          primary: "white",
          secondary: "white",
          accent: "white",
          stroke: "white"
        };
      } else if (logoColor === "black") {
        return {
          primary: "black",
          secondary: "black",
          accent: "black",
          stroke: "black"
        };
      } else {
        return {
          primary: "url(#logoGradient)",
          secondary: "#392682",
          accent: "#28ADA8",
          stroke: "white"
        };
      }
    };
  
    const colors = getColors();
  
    return (
      <div className="logo-container">
        <div className="tabs">
          <div className="tab-list">
            <button 
              className={`tab-button ${selectedLogo === "1" ? "active" : ""}`}
              onClick={() => setSelectedLogo("1")}
            >
              Diseño 1
            </button>
            <button 
              className={`tab-button ${selectedLogo === "2" ? "active" : ""}`}
              onClick={() => setSelectedLogo("2")}
            >
              Diseño 2
            </button>
            <button 
              className={`tab-button ${selectedLogo === "3" ? "active" : ""}`}
              onClick={() => setSelectedLogo("3")}
            >
              Diseño 3
            </button>
            <button 
              className={`tab-button ${selectedLogo === "4" ? "active" : ""}`}
              onClick={() => setSelectedLogo("4")}
            >
              Diseño 4
            </button>
            <button 
              className={`tab-button ${selectedLogo === "5" ? "active" : ""}`}
              onClick={() => setSelectedLogo("5")}
            >
              Diseño 5
            </button>
          </div>
          
          <div className="tab-content">
            {/* Logo Design 1 - Original Circle with Cross */}
            {selectedLogo === "1" && (
              <div className="logo-preview" style={{ backgroundColor: background === "transparent" ? "transparent" : "none" }}>
                <svg
                  id="meditest-logo-1"
                  width={size}
                  height={size}
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#392682" />
                      <stop offset="100%" stopColor="#28ADA8" />
                    </linearGradient>
                  </defs>
                  
                  <circle cx="100" cy="100" r="45" fill={colors.primary} />
                  <path 
                    d="M80 100 H120 M100 80 V120" 
                    stroke={colors.stroke} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M60 135 L75 135 L85 120 L95 150 L105 130 L115 140 L125 135 L140 135" 
                    stroke={colors.accent} 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
            
            {/* Logo Design 2 - Hexagonal with Cross */}
            {selectedLogo === "2" && (
              <div className="logo-preview" style={{ backgroundColor: background === "transparent" ? "transparent" : "none" }}>
                <svg
                  id="meditest-logo-2"
                  width={size}
                  height={size}
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#392682" />
                      <stop offset="100%" stopColor="#28ADA8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Hexagon shape */}
                  <path 
                    d="M100 55 L140 80 L140 130 L100 155 L60 130 L60 80 Z" 
                    fill={colors.primary} 
                  />
                  
                  {/* Medical cross */}
                  <path 
                    d="M85 105 H115 M100 90 V120" 
                    stroke={colors.stroke} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                  />
                  
                  {/* Heartbeat line below */}
                  <path 
                    d="M55 145 L70 145 L80 135 L90 155 L100 140 L110 150 L120 145 L145 145" 
                    stroke={logoColor === "original" ? colors.accent : colors.primary} 
                    strokeWidth="5" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
            
            {/* Logo Design 3 - Modern Heart + Cross */}
            {selectedLogo === "3" && (
              <div className="logo-preview" style={{ backgroundColor: background === "transparent" ? "transparent" : "none" }}>
                <svg
                  id="meditest-logo-3"
                  width={size}
                  height={size}
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#392682" />
                      <stop offset="100%" stopColor="#28ADA8" />
                    </linearGradient>
                    <filter id="shadow3" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" floodColor="#392682" />
                    </filter>
                  </defs>
                  
                  {/* Heart shape with gradient */}
                  <path 
                    d="M100,150 C130,120 170,90 130,65 C110,50 100,70 100,70 C100,70 90,50 70,65 C30,90 70,120 100,150 Z" 
                    fill={colors.primary}
                    filter={logoColor === "original" ? "url(#shadow3)" : "none"}
                  />
                  
                  {/* Medical cross overlay */}
                  <path 
                    d="M85 95 H115 M100 80 V110" 
                    stroke={colors.stroke} 
                    strokeWidth="7" 
                    strokeLinecap="round"
                  />
                  
                  {/* Pulse line at bottom */}
                  <path 
                    d="M60 170 L75 170 L85 160 L95 180 L105 150 L115 170 L125 170 L140 170" 
                    stroke={logoColor === "original" ? colors.accent : colors.primary} 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
            
            {/* Logo Design 4 - Stethoscope */}
            {selectedLogo === "4" && (
              <div className="logo-preview" style={{ backgroundColor: background === "transparent" ? "transparent" : "none" }}>
                <svg
                  id="meditest-logo-4"
                  width={size}
                  height={size}
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#392682" />
                      <stop offset="100%" stopColor="#28ADA8" />
                    </linearGradient>
                    <filter id="shadow4" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" floodColor="#392682" />
                    </filter>
                  </defs>
                  
                  {/* Circle background */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="60" 
                    fill={logoColor === "original" ? "white" : "none"} 
                    filter={logoColor === "original" ? "url(#shadow4)" : "none"} 
                  />
                  
                  {/* Stethoscope */}
                  <circle 
                    cx="75" 
                    cy="90" 
                    r="15" 
                    fill={logoColor === "original" ? colors.secondary : colors.primary} 
                  />
                  <path 
                    d="M75 105 Q75 130 100 130 L120 130 Q140 130 140 110 L140 90" 
                    fill="none" 
                    stroke={colors.primary} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                  />
                  <circle 
                    cx="140" 
                    cy="80" 
                    r="10" 
                    fill={logoColor === "original" ? colors.accent : colors.primary} 
                  />
                  
                  {/* Heartbeat line */}
                  <path 
                    d="M60 150 L75 150 L85 140 L95 160 L105 140 L115 150 L125 150 L140 150" 
                    stroke={logoColor === "original" ? colors.accent : colors.primary} 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
            
            {/* Logo Design 5 - Modern Medical App Icon */}
            {selectedLogo === "5" && (
              <div className="logo-preview" style={{ backgroundColor: background === "transparent" ? "transparent" : "none" }}>
                <svg
                  id="meditest-logo-5"
                  width={size}
                  height={size}
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#392682" />
                      <stop offset="100%" stopColor="#28ADA8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Rounded square background */}
                  <rect x="50" y="50" width="100" height="100" rx="20" fill={colors.primary} />
                  
                  {/* Medical symbol - modern caduceus */}
                  <path 
                    d="M100 70 L100 130" 
                    stroke={colors.stroke} 
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  
                  <path 
                    d="M80 85 Q100 65 120 85 Q140 105 120 125 Q100 145 80 125 Q60 105 80 85Z" 
                    fill="none"
                    stroke={colors.stroke} 
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  
                  {/* Heartbeat line below */}
                  <path 
                    d="M60 160 L75 160 L85 150 L95 170 L105 150 L115 160 L125 160 L140 160" 
                    stroke={colors.stroke} 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        <div className="controls">
          <div className="control-row">
            <label htmlFor="size-slider" className="control-label">
              Tamaño: {size}px
            </label>
            <input
              id="size-slider"
              type="range"
              min="50"
              max="400"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="control-row">
            <label className="control-label">Color del logotipo:</label>
            <div className="color-options">
              <button 
                className={`color-button ${logoColor === "original" ? "active" : ""}`} 
                onClick={() => setLogoColor("original")}
                style={{ 
                  background: "linear-gradient(135deg, #392682, #28ADA8)",
                  color: "white"
                }}
              >
                Original
              </button>
              <button 
                className={`color-button ${logoColor === "white" ? "active" : ""}`} 
                onClick={() => setLogoColor("white")}
                style={{ 
                  backgroundColor: "white",
                  color: "#333",
                  border: "1px solid #ccc"
                }}
              >
                Blanco
              </button>
              <button 
                className={`color-button ${logoColor === "black" ? "active" : ""}`} 
                onClick={() => setLogoColor("black")}
                style={{ 
                  backgroundColor: "black",
                  color: "white"
                }}
              >
                Negro
              </button>
            </div>
          </div>
          
          <div className="control-row">
            <label className="control-label">Fondo:</label>
            <div className="background-options">
              <button 
                className={`bg-button ${background === "transparent" ? "active" : ""}`} 
                onClick={() => setBackground("transparent")}
                style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><rect x=\"0\" y=\"0\" width=\"8\" height=\"8\" fill=\"%23f0f0f0\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" fill=\"%23f0f0f0\"/></svg>')" }}
              >
                Transparente
              </button>
              <button 
                className={`bg-button ${background === "white" ? "active" : ""}`} 
                onClick={() => setBackground("white")}
                style={{ backgroundColor: "white" }}
              >
                Blanco
              </button>
              <button 
                className={`bg-button ${background === "black" ? "active" : ""}`} 
                onClick={() => setBackground("black")}
                style={{ backgroundColor: "black", color: "white" }}
              >
                Negro
              </button>
            </div>
          </div>
          
          <div className="download-buttons">
            <button className="button outline" onClick={() => handleDownload("svg")}>
              <DownloadIcon /> Descargar SVG
            </button>
            <button className="button primary" onClick={() => handleDownload("png")}>
              <DownloadIcon /> Descargar PNG
            </button>
          </div>
        </div>
      </div>
    );
  }