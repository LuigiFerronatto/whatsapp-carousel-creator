import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './CarouselPreview.module.css';

// Constantes para configurações
const CONFIG = {
  MAX_BODY_TEXT_LENGTH: 1024,
  MAX_CARD_TEXT_LENGTH: 160,
  MAX_BUTTON_TEXT_LENGTH: 25,
};

// Componente de Ícones
const ButtonIcon = ({ type }) => {
  const iconMap = {
    QUICK_REPLY: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
        <path fill="currentColor" d="M28.88 30a1 1 0 0 1-.88-.5A15.19 15.19 0 0 0 15 22v6a1 1 0 0 1-.62.92a1 1 0 0 1-1.09-.21l-12-12a1 1 0 0 1 0-1.42l12-12a1 1 0 0 1 1.09-.21A1 1 0 0 1 15 4v6.11a17.19 17.19 0 0 1 15 17a16 16 0 0 1-.13 2a1 1 0 0 1-.79.86Z"/>
      </svg>
    ),
    URL: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
        <path fill="currentColor" d="M5 5v22h22V5zm2 2h18v18H7zm6 3v2h5.563L9.28 21.281l1.438 1.438L20 13.437V19h2v-9z"/>
      </svg>
    ),
    PHONE_NUMBER: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14 14">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" 
          d="M8.76 13a3.19 3.19 0 0 0 4-.44l.45-.44a1.08 1.08 0 0 0 0-1.51L11.3 8.72a1.07 1.07 0 0 0-1.5 0h0a1.08 1.08 0 0 1-1.51 0l-3-3a1.06 1.06 0 0 1 0-1.51h0a1.07 1.07 0 0 0 0-1.5L3.39.81a1.08 1.08 0 0 0-1.51 0l-.44.45a3.19 3.19 0 0 0-.44 4A28.94 28.94 0 0 0 8.76 13Z"/>
      </svg>
    )
  };

  return iconMap[type] || null;
};

// Truncagem de texto reutilizável
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;
};

// Componente de Botão de Navegação
const NavButton = ({ direction, onClick }) => (
  <button
    className={`${styles.navButton} ${styles[`${direction}Button`]}`}
    onClick={onClick}
    aria-label={`${direction === 'prev' ? 'Anterior' : 'Próximo'} card`}
  >
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d={direction === 'prev' 
          ? "M15 18L9 12L15 6" 
          : "M9 18L15 12L9 6"
        } 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  </button>
);

// Componente Principal
const CarouselPreview = ({ 
  cards = [], 
  bodyText = '', 
  contactName = 'Blip CDA' 
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const cardsWrapperRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);


  // Atualiza a posição de translação com base no índice atual
  const updateTranslatePosition = (index) => {
    const cardWidth = 90; // Considera a largura dos cards
    const gap = 1.5; // Considera o espaçamento entre os cards
    const newTranslate = -(index * (cardWidth + gap)); // Considera o espaçamento
    setCurrentTranslate(newTranslate);
    setPrevTranslate(newTranslate);
    setDragOffset(0);
};



  // Navegação cíclica dos cards
  const goToPrevCard = () => {
    setCurrentCardIndex(prev => {
      const newIndex = prev === 0 ? cards.length - 1 : prev - 1;
      updateTranslatePosition(newIndex);
      return newIndex;
    });
  };

  const goToNextCard = () => {
    setCurrentCardIndex(prev => {
      const newIndex = prev === cards.length - 1 ? 0 : prev + 1;
      updateTranslatePosition(newIndex);
      return newIndex;
    });
  };

  // Manipuladores para interação de arrasto
  const dragStart = (event) => {
    // Pegando a posição inicial do toque ou clique
    const position = event.type.includes('mouse')
      ? event.pageX
      : event.touches[0].clientX;
    
    setIsDragging(true);
    setStartPosition(position);
  };

  const dragMove = (event) => {
    if (!isDragging) return;

    // Evitar scroll padrão da página durante o arrasto
    event.preventDefault();
    
    // Calculando a posição atual
    const currentPosition = event.type.includes('mouse')
      ? event.pageX
      : event.touches[0].clientX;
    
    // Calculando a distância do arrasto e convertendo em porcentagem relativa à largura do wrapper
    const wrapperWidth = cardsWrapperRef.current ? cardsWrapperRef.current.offsetWidth : 1;
    const movePercent = ((currentPosition - startPosition) / wrapperWidth) * 100;
    
    // Registrando o offset atual do arrasto
    setDragOffset(movePercent);
    
    // Aplicando a nova translação
    setCurrentTranslate(prevTranslate + movePercent);
  };

  const dragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Decidindo para qual card navegar com base na posição final
    const threshold = 15; // Porcentagem mínima de arrasto para acionar mudança de card
    
    let newIndex = currentCardIndex;
    
    if (dragOffset > threshold) {
      // Arrastou para direita (card anterior)
      newIndex = Math.max(0, currentCardIndex - 1);
    } else if (dragOffset < -threshold) {
      // Arrastou para esquerda (próximo card)
      newIndex = Math.min(cards.length - 1, currentCardIndex + 1);
    }
    
    // Atualizando o índice do card
    setCurrentCardIndex(newIndex);
    updateTranslatePosition(newIndex);
  };

  // Registrando eventos de mouse e toque
  useEffect(() => {
    const wrapper = cardsWrapperRef.current;
    if (!wrapper) return;
    
    // Para dispositivos com toque
    wrapper.addEventListener('touchstart', dragStart, { passive: true });
    wrapper.addEventListener('touchmove', dragMove, { passive: false });
    wrapper.addEventListener('touchend', dragEnd);
    
    // Para navegadores desktop
    wrapper.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
    
    return () => {
      // Limpeza dos event listeners
      wrapper.removeEventListener('touchstart', dragStart);
      wrapper.removeEventListener('touchmove', dragMove);
      wrapper.removeEventListener('touchend', dragEnd);
      
      wrapper.removeEventListener('mousedown', dragStart);
      window.removeEventListener('mousemove', dragMove);
      window.removeEventListener('mouseup', dragEnd);
    };
  }, [isDragging, startPosition, prevTranslate, currentCardIndex, dragOffset]);

  // Inicialização do carrossel
  useEffect(() => {
    if (cards.length > 0) {
      updateTranslatePosition(currentCardIndex);
    }
  }, [cards.length]);

  // Memoização dos dots para performance
  const navigationDots = useMemo(() => (
    <div className={styles.dots}>
      {cards.map((_, index) => (
        <div 
          key={index} 
          className={`${styles.dot} ${index === currentCardIndex ? styles.activeDot : ''}`}
          onClick={() => {
            setCurrentCardIndex(index);
            updateTranslatePosition(index);
          }}
        />
      ))}
    </div>
  ), [cards, currentCardIndex]);

  // Renderização condicional dos cards
  const hasValidCards = cards.length > 0;

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
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M19 12H5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12 19L5 12L12 5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div className={styles.contactInfo}>
            <div className={styles.contactAvatar} />
            <div className={styles.contactName}>{contactName}</div>
          </div>
          
          <div className={styles.moreButton}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      
      <div className={styles.chatWindow}>
        {bodyText && (
          <div className={styles.messageBodyText}>
            {truncateText(bodyText, CONFIG.MAX_BODY_TEXT_LENGTH)}
          </div>
        )}
        
        {hasValidCards && (
          <div className={styles.carouselContainer}>
            <NavButton direction="prev" onClick={goToPrevCard} />
            
            <div className={styles.cardsContainer}>
              <div 
                ref={cardsWrapperRef}
                className={`${styles.cardsWrapper} ${isDragging ? styles.grabbing : styles.grab}`}
                style={{ 
                  transform: `translateX(${currentTranslate}%)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease' 
                }}
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
                              <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  d="M5 3L19 12L5 21V3Z" 
                                  stroke="white" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className={styles.placeholderImage}>
                          <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect 
                              x="3" 
                              y="3" 
                              width="18" 
                              height="18" 
                              rx="2" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            />
                            <circle 
                              cx="8.5" 
                              cy="8.5" 
                              r="1.5" 
                              fill="currentColor"
                            />
                            <path 
                              d="M21 15L16 10L5 21" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.cardBody}>
                      {card.bodyText ? (
                        <p>{truncateText(card.bodyText, CONFIG.MAX_CARD_TEXT_LENGTH)}</p>
                      ) : (
                        <p className={styles.placeholderText}>Texto do card</p>
                      )}
                    </div>
                    
                    {card.buttons && card.buttons.length > 0 && (
                      <div className={styles.cardButtons}>
                        <div className={styles.separator}></div>
                        {card.buttons.map((button, btnIndex) => (
                          <React.Fragment key={btnIndex}>
                            {btnIndex > 0 && <div className={styles.separator}></div>}
                            <button 
                              className={styles.cardButton}
                              onClick={() => console.log(`Botão ${btnIndex + 1} clicado`, button)}
                            >
                              {button.type && (
                                <span className={styles.buttonIcon}>
                                  <ButtonIcon type={button.type} />
                                </span>
                              )}
                              {truncateText(
                                button.text || `Botão ${btnIndex + 1}`, 
                                CONFIG.MAX_BUTTON_TEXT_LENGTH
                              )}
                            </button>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <NavButton direction="next" onClick={goToNextCard} />
          </div>
        )}
        
        {navigationDots}
      </div>
    </div>
  );
};

export default CarouselPreview;