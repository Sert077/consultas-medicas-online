import React from 'react';
import '../css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-left">
                <img src="/images/footerlogo1.png" alt="Logo footer" className="footer-logo" />
            </div>
            <div className="footer-center">
                <div className="social-icons">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/facebook-100.png" alt="Facebook" />
                    </a>
                    <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/whatsapp-100.png" alt="WhatsApp" />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/instagram-100.png" alt="Instagram" />
                    </a>
                    <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
                        <img src="/images/x-100.png" alt="X" />
                    </a>
                </div>
            </div>
            <div className="footer-right">
                <p>Copyright © 2024, Meditest-Consultas Médicas Online</p>
                <p>Todos los derechos reservados</p>
                <div className="footer-links">
                    <a href="#" className="footer-link">Información legal</a>
                    <a href="#" className="footer-link">Política de privacidad</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
