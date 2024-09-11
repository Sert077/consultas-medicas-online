import React from 'react';
import '../css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-left">
                <p>© 2024, Consultas Médicas Online</p>
            </div>
            <div className="social-icons">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                    <img src="/images/facebook.png" alt="Facebook" />
                </a>
                <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
                    <img src="/images/whatsapp.png" alt="WhatsApp" />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <img src="/images/instagram.png" alt="Instagram" />
                </a>
                <a href="https://www.x.com" target="_blank" rel="noopener noreferrer">
                    <img src="/images/twitterx.png" alt="X" />
                </a>
            </div>
            <div className="footer-right">
                <a href="#" className="contact-button" >Contáctanos</a>
            </div>
        </footer>
    );
}

export default Footer;
