// previews/CarouselPreview.js

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
      <svg viewBox="0 0 395 395" xmlns="http://www.w3.org/2000/svg">
<path fill="currentColor" d="M355.596 369.39C353.405 369.42 351.247 368.866 349.342 367.783C347.437 366.701 345.856 365.13 344.761 363.233C328.362 335.296 304.988 312.098 276.928 295.91C248.869 279.722 217.086 271.099 184.693 270.886V344.764C184.68 347.195 183.949 349.567 182.59 351.583C181.232 353.599 179.307 355.168 177.059 356.092C174.816 357.034 172.345 357.292 169.956 356.832C167.568 356.372 165.369 355.214 163.637 353.506L15.8824 205.751C14.7283 204.606 13.8123 203.244 13.1872 201.744C12.5621 200.243 12.2402 198.634 12.2402 197.009C12.2402 195.383 12.5621 193.774 13.1872 192.273C13.8123 190.773 14.7283 189.411 15.8824 188.266L163.637 40.5113C165.369 38.8028 167.568 37.6454 169.956 37.1852C172.345 36.7251 174.816 36.9827 177.059 37.9256C179.307 38.8493 181.232 40.418 182.59 42.4338C183.949 44.4497 184.68 46.8226 184.693 49.2535V124.485C235.634 131.028 282.458 155.87 316.438 194.382C350.419 232.893 369.237 282.446 369.386 333.805C369.357 342.039 368.823 350.263 367.786 358.431C367.478 360.993 366.374 363.393 364.628 365.293C362.883 367.193 360.585 368.497 358.059 369.02L355.596 369.39ZM178.536 246.26C209.939 245.809 241.066 252.182 269.765 264.937C298.464 277.692 324.052 296.526 344.761 320.138C341.056 275.471 321.558 233.586 289.764 201.995C257.97 170.404 215.961 151.175 171.271 147.757C168.202 147.479 165.347 146.061 163.273 143.781C161.198 141.501 160.054 138.526 160.067 135.444V78.9276L41.9858 197.009L160.067 315.09V258.573C160.067 255.308 161.364 252.176 163.673 249.867C165.982 247.558 169.114 246.26 172.38 246.26H179.029H178.536Z "/>
</svg>
    ),
    URL: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path fill="currentColor" d="M5 5v22h22V5zm2 2h18v18H7zm6 3v2h5.563L9.28 21.281l1.438 1.438L20 13.437V19h2v-9z"/>
      </svg>
    ),
    PHONE_NUMBER: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
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

// Formata o texto com marcação WhatsApp
const formatWhatsAppText = (text) => {
  if (!text) return '';
  
  // Substituir variáveis 
  let formattedText = text.replace(/\{\{(\d+)\}\}/g, (match, number) => {
    return `<span class="${styles.variable}">{{${number}}}</span>`;
  });

  // Negrito: *texto*
  formattedText = formattedText.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  
  // Itálico: _texto_
  formattedText = formattedText.replace(/\_([^_\n]+)\_/g, '<em>$1</em>');
  
  // Tachado: ~texto~
  formattedText = formattedText.replace(/\~([^~\n]+)\~/g, '<del>$1</del>');
  
  // Código: ```texto```
  formattedText = formattedText.replace(/```([^`]+)```/g, '<code class="multiline-code">$1</code>');
  
  // Código inline: `texto`
  formattedText = formattedText.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  
  // Lista com marcadores: * texto ou - texto
  formattedText = formattedText.replace(/^[*-]\s(.+)$/gm, '<div class="list-item"><span class="bullet">•</span> $1</div>');
  
  // Lista numerada: 1. texto
  formattedText = formattedText.replace(/^(\d+)\.\s(.+)$/gm, '<div class="list-item"><span class="number">$1.</span> $2</div>');
  
  // Citação: > texto
  formattedText = formattedText.replace(/^>\s(.+)$/gm, '<div class="blockquote">$1</div>');
  
  // Quebra de linha
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
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
  bodyText = 'Exemplo de Body Text', 
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
    const gap = 1.45; // Considera o espaçamento entre os cards
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
          <div 
            className={styles.messageBodyText} 
            dangerouslySetInnerHTML={{ __html: formatWhatsAppText(bodyText) }}
          />
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
                        <div dangerouslySetInnerHTML={{ __html: formatWhatsAppText(card.bodyText) }} />
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