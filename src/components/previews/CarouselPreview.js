// components/previews/CarouselPreview.js
import React, { useState } from 'react';
import styles from './CarouselPreview.module.css';

/**
 * Componente para visualização de preview do carrossel do WhatsApp
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.cards - Array de cards do carrossel
 * @param {string} props.bodyText - Texto do corpo da mensagem
 * @returns {JSX.Element} Componente de preview do carrossel
 */
const CarouselPreview = ({ cards = [], bodyText = '' }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Navegar para o card anterior
  const goToPrevCard = () => {
    setCurrentCardIndex(prev => 
      prev === 0 ? cards.length - 1 : prev - 1
    );
  };

  // Navegar para o próximo card
  const goToNextCard = () => {
    setCurrentCardIndex(prev => 
      prev === cards.length - 1 ? 0 : prev + 1
    );
  };

  // Truncar texto se for muito longo
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
  };

  // Verificar se existem cards válidos para exibir
  const hasValidCards = cards && cards.length > 0;
  
  // Separador em formato de pontos para navegação
  const renderDots = () => {
    return (
      <div className={styles.dots}>
        {cards.map((_, index) => (
          <div 
            key={index} 
            className={`${styles.dot} ${index === currentCardIndex ? styles.activeDot : ''}`}
            onClick={() => setCurrentCardIndex(index)}
          />
        ))}
      </div>
    );
  };

  return (
      
      <div className={styles.phoneMockup}>
        <div className={styles.phoneHeader}>
          <div className={styles.phoneStatusBar}>
            <span>9:41</span>
            <div className={styles.phoneIcons}>
              <span>4G</span>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
          <div className={styles.whatsappHeader}>
            <div className={styles.backButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.contactInfo}>
              <div className={styles.contactAvatar}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.contactName}>Empresa</div>
            </div>
            <div className={styles.moreButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className={styles.chatWindow}>
          {bodyText && (
            <div className={styles.messageBodyText}>
              {truncateText(bodyText, 160)}
            </div>
          )}
          
          {hasValidCards && (
            <div className={styles.carouselContainer}>
              <button 
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={goToPrevCard}
                aria-label="Card anterior"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className={styles.cardsContainer}>
                <div 
                  className={styles.cardsWrapper}
                  style={{ transform: `translateX(${-currentCardIndex * 100}%)` }}
                >
                  {cards.map((card, index) => (
                    <div key={index} className={styles.card}>
                      <div className={styles.cardHeader}>
                        {card.fileUrl ? (
                          card.fileType === 'image' ? (
                            <img 
                              src={card.fileUrl}
                              alt={`Card ${index + 1}`}
                              className={styles.cardImage}
                            />
                          ) : (
                            <div className={styles.videoContainer}>
                              <video 
                                src={card.fileUrl} 
                                className={styles.cardVideo} 
                                controls={false}
                              />
                              <div className={styles.playButton}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 3L19 12L5 21V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className={styles.placeholderImage}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                              <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.cardBody}>
                        {card.bodyText ? (
                          <p>{truncateText(card.bodyText, 80)}</p>
                        ) : (
                          <p className={styles.placeholderText}>Texto do card</p>
                        )}
                      </div>
                      
                      <div className={styles.cardButtons}>
                        {card.buttons && card.buttons.map((button, btnIndex) => (
                          <button
                            key={btnIndex}
                            className={styles.cardButton}
                          >
                            {button.text ? truncateText(button.text, 20) : `Botão ${btnIndex + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={goToNextCard}
                aria-label="Próximo card"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          
          {renderDots()}
        </div>
      </div>
  );
};

export default CarouselPreview;