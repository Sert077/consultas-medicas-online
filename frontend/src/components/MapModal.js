import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { FaCrosshairs } from "react-icons/fa";
import { FaLocationCrosshairs } from "react-icons/fa6";
import L from "leaflet";

const MapModal = ({ setShowMap, setFormData, formData }) => {
  const [position, setPosition] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false); // Nuevo estado
  const fetchRef = useRef(null);
  const mapRef = useRef(null);

  // 🌍 Obtener la ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setFormData((prevData) => ({
            ...prevData,
            address: `Lat: ${latitude}, Lng: ${longitude}`,
            lat: latitude,
            lng: longitude,
          }));
        },
        () => {
          console.log("No se pudo obtener la ubicación del usuario.");
          setPosition([0, 0]);
        }
      );
    }
  }, [setFormData]);

  // 📍 Permitir seleccionar ubicación con clic en el mapa
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
        setShowSuggestions(false);
        setIsLocationSelected(true); // Marcar como seleccionado
      },
    });

    return position ? <Marker position={position} icon={customIcon} /> : null;
  }

  // 🔍 Buscar direcciones en Nominatim con "debounce"
  useEffect(() => {
    if (search.length < 3 || isLocationSelected) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);

    if (fetchRef.current) {
      clearTimeout(fetchRef.current);
    }

    fetchRef.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]));
    }, 500);
  }, [search, isLocationSelected]);

  // 📌 Seleccionar una dirección de la lista y mover el mapa
  const handleSelectLocation = (lat, lon, display_name) => {
    setPosition([lat, lon]);
    setFormData((prevData) => ({
      ...prevData,
      address: display_name,
      lat,
      lng: lon,
    }));
    setSearch(display_name);
    setShowSuggestions(false);
    setIsLocationSelected(true); // Marcar como seleccionado

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 13);
    }
  };

  // 🗺 Componente que maneja el mapa
  function MapComponent() {
    const map = useMap();
    mapRef.current = map;
    return null;
  }

  // 🎯 Centrar el mapa en la ubicación actual del usuario
  const handleCenterMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 13);
          }
        },
        () => {
          console.log("No se pudo obtener la ubicación del usuario.");
        }
      );
    }
  };

  // 🔄 Reiniciar la selección si el usuario modifica el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setIsLocationSelected(false); // Reiniciar la selección
  };

  return (
    <div className="map-modal">
      <div className="map-container">
        <button className="close-btn" onClick={() => setShowMap(false)}> Seleccionar y Cerrar</button>

        {/* 🔍 Input de búsqueda */}
        <input
          type="text"
          placeholder="Escribe la dirección..."
          value={search}
          onChange={handleSearchChange} // Usar la nueva función
          onFocus={() => setShowSuggestions(search.length >= 3 && !isLocationSelected)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="search-input"
        />

        {/* 📌 Lista de sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((place, index) => (
              <li key={index} onClick={() => handleSelectLocation(place.lat, place.lon, place.display_name)}>
                {place.display_name}
              </li>
            ))}
          </ul>
        )}

        {/* 🗺 Mapa */}
        {position ? (
          <MapContainer center={position} zoom={13} style={{ height: "400px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
            <MapComponent />
          </MapContainer>
        ) : (
          <p>Cargando mapa...</p>
        )}

        <button className="floating-btn" onClick={handleCenterMap}>
        <FaLocationCrosshairs className="location-icon"/>
        </button>
      </div>
    </div>
  );
};

// 🎨 Icono personalizado para el marcador
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

export default MapModal;