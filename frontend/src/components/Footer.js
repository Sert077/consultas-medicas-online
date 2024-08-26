import React from 'react';
import '../css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <button className="contact-button">Contáctanos</button>
            <div className="social-icons">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <img src="/path_to_icons/facebook-icon.png" alt="Facebook" />
                </a>
                <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
                    <img src="/path_to_icons/whatsapp-icon.png" alt="WhatsApp" />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <img src="/path_to_icons/instagram-icon.png" alt="Instagram" />
                </a>
                <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
                    <img src="/path_to_icons/x-icon.png" alt="X" />
                </a>
            </div>
            <p className="footer-right">© 2024, Consultas Médicas Online</p>
        </footer>
    );
}

export default Footer;
