// components/ui/Footer/Footer.jsx
import React from 'react';
import { FiInfo, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { BiBug } from 'react-icons/bi';
import { FaLinkedin } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const handleReportError = () => {
    // Implementar lógica para reportar erro
    window.open('URL_PARA_REPORTAR_ERRO', '_blank');
  };

  const handleOpenDocs = () => {
    window.open('URL_DA_DOCUMENTACAO', '_blank');
  };

  const handleOpenSupport = () => {
    window.open('URL_DO_SUPORTE', '_blank');
  };

  const handleOpenSuggestions = () => {
    window.open('URL_PARA_SUGESTOES', '_blank');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerInfo}>
          <p>WhatsApp Carousel Creator © {new Date().getFullYear()}</p>
          <p href="https://www.linkedin.com/in/luigiferronatto/">Developed By: Luigi Ferronatto</p>
          <p>CDA | Solution's Advocate at <span>Blip</span></p>
        </div>

        <div className={styles.footerActions}>
          <a 
            href="https://www.linkedin.com/in/luigiferronatto/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
            title="LinkedIn"
          >
            <FaLinkedin />
          </a>

          <button 
            onClick={handleReportError}
            className={styles.footerButton}
            title="Report Bug"
          >
            <BiBug />
          </button>

          <button 
            onClick={handleOpenDocs}
            className={styles.footerButton}
            title="Documentation"
          >
            <FiFileText />
          </button>

          <button 
            onClick={handleOpenSupport}
            className={styles.footerButton}
            title="Support"
          >
            <FiInfo />
          </button>

          <button 
            onClick={handleOpenSuggestions}
            className={styles.footerButton}
            title="Suggestions"
          >
            <FiMessageSquare />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;