import React from 'react';
import './Footer.css'; 

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; 2025 PDN products. All rights reserved.</p>
            <nav className="footer-nav">
                <a href="/terms-of-service">Terms of Service</a>
                <a href="/privacy-policy">Privacy Policy</a>
            </nav>
        </footer>
    );
};

export default Footer;