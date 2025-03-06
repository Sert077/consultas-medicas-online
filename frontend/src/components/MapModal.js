import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// ✅ Componente para mostrar el mapa en un modal
const MapModal = ({ setShowMap, setFormData, formData }) => {
    const [position, setPosition] = useState([0, 0]);
  
    function LocationMarker() {
      useMapEvents({
        click(e) {
          const { lat, lng } = e.latlng;
          setPosition([lat, lng]);
          setFormData((prevData) => ({
            ...prevData,
            address: `Lat: ${lat}, Lng: ${lng}`,
            lat,
            lng,
          }));
        },
      });
  
      return position ? <Marker position={position} icon={customIcon} /> : null;
    }
  
    return (
      <div className="map-modal">
        <div className="map-container">
          <button className="close-btn" onClick={() => setShowMap(false)}>
            ✖ Cerrar
          </button>
          <MapContainer
            center={[0, 0]}
            zoom={2}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        </div>
      </div>
    );
  };
  
  // 🎨 Icono personalizado para el marcador
  const customIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
  });

export default MapModal  