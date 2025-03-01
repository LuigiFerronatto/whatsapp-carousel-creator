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
    return `${text.slice(0, maxLength)}...`;
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
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.contactInfo}>
            <div className={styles.contactAvatar}>
            </div>
            <div className={styles.contactName}>Blip CDA</div>
          </div>
          <div className={styles.moreButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.chatWindow}>
        {bodyText && (
          <div className={styles.messageBodyText}>
            {truncateText(bodyText, 1024)}
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
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                                <path d="M5 3L19 12L5 21V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className={styles.placeholderImage}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      {card.bodyText ? (
                        <p>{truncateText(card.bodyText, 160)}</p>
                      ) : (
                        <p className={styles.placeholderText}>Texto do card</p>
                      )}
                    </div>

                    <div className={styles.cardButtons}>
  {/* Adiciona um separador antes do primeiro botão */}
  {card.buttons.length > 0 && <div className={styles.separator}></div>}

  {card.buttons.map((button, btnIndex) => {
    let icon;

    // Determina o ícone baseado no tipo do botão
    switch(button.type) {
      case "QUICK_REPLY":
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32"><path fill="currentColor" d="M28.88 30a1 1 0 0 1-.88-.5A15.19 15.19 0 0 0 15 22v6a1 1 0 0 1-.62.92a1 1 0 0 1-1.09-.21l-12-12a1 1 0 0 1 0-1.42l12-12a1 1 0 0 1 1.09-.21A1 1 0 0 1 15 4v6.11a17.19 17.19 0 0 1 15 17a16 16 0 0 1-.13 2a1 1 0 0 1-.79.86ZM14.5 20A17.62 17.62 0 0 1 28 26a15.31 15.31 0 0 0-14.09-14a1 1 0 0 1-.91-1V6.41L3.41 16L13 25.59V21a1 1 0 0 1 1-1h.54Z"/></svg>
        );
        break;
      case "URL":
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32"><path fill="currentColor" d="M5 5v22h22V5zm2 2h18v18H7zm6 3v2h5.563L9.28 21.281l1.438 1.438L20 13.437V19h2v-9z"/></svg>
        );
        break;
      case "PHONE_NUMBER":
        icon = (
          <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 14 14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M8.76 13a3.19 3.19 0 0 0 4-.44l.45-.44a1.08 1.08 0 0 0 0-1.51L11.3 8.72a1.07 1.07 0 0 0-1.5 0h0a1.08 1.08 0 0 1-1.51 0l-3-3a1.06 1.06 0 0 1 0-1.51h0a1.07 1.07 0 0 0 0-1.5L3.39.81a1.08 1.08 0 0 0-1.51 0l-.44.45a3.19 3.19 0 0 0-.44 4A28.94 28.94 0 0 0 8.76 13Z"/></svg>
        );
        break;
      default:
        icon = null;
    }

    return (
      <React.Fragment key={btnIndex}>
        {/* Adiciona separador entre os botões */}
        {btnIndex > 0 && <div className={styles.separator}></div>}

        <button 
          className={styles.cardButton}
          onClick={() => {
            // Adicione a lógica de clique aqui se necessário
            console.log(`Botão ${btnIndex + 1} clicado`, button);
          }}
        >
          {icon && <span className={styles.buttonIcon}>{icon}</span>}
          {button.text ? truncateText(button.text, 30) : `Botão ${btnIndex + 1}`}
        </button>
      </React.Fragment>
    );
  })}
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
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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