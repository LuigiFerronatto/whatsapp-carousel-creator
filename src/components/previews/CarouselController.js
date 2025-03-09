// src/components/previews/CarouselController.js

/**
 * Controlador para permitir o acesso programático ao CarouselPreview
 * Com suporte para desabilitar interação durante pré-renderização
 */
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { downloadPreview } from './downloadPreview';

// Criação do contexto para controle do carrossel
const CarouselControlContext = createContext();

/**
 * Hook para utilizar o controle do carrossel
 * @returns {Object} Funções de controle do carrossel
 */
export const useCarouselControl = () => {
  const context = useContext(CarouselControlContext);
  if (!context) {
    throw new Error('useCarouselControl deve ser usado dentro de um CarouselControlProvider');
  }
  return context;
};

/**
 * Provider para controle programático do carrossel
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Provider do contexto
 */
export const CarouselControlProvider = ({ children }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [pendingCardIndex, setPendingCardIndex] = useState(null);
  const carouselRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [interactionDisabled, setInteractionDisabled] = useState(false);
  
  // Verificar periodicamente se a pré-renderização está ativa
  useEffect(() => {
    // Função para verificar e atualizar o estado
    const checkPreRendering = () => {
      const preRenderingActive = downloadPreview.isPreRenderingActive();
      setInteractionDisabled(preRenderingActive);
    };
    
    // Inicialmente verificar se já está em pré-renderização
    checkPreRendering();
    
    // Polling para verificar mudanças na pré-renderização
    const intervalId = setInterval(checkPreRendering, 500);
    
    // Também verificar quando a janela recebe foco
    window.addEventListener('focus', checkPreRendering);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkPreRendering);
    };
  }, []);
  
  // Registrar uma referência ao componente CarouselPreview
  const registerCarousel = (ref) => {
    if (ref && !carouselRef.current) {
      carouselRef.current = ref;
      setIsInitialized(true);
    }
  };
  
  // Avançar para o próximo card
  const goToNextCard = () => {
    // Evitar navegação durante pré-renderização
    if (interactionDisabled || !carouselRef.current) return;
    
    const cards = carouselRef.current.getCards();
    if (!cards || cards.length === 0) return;
    
    const newIndex = currentCardIndex === cards.length - 1 ? 0 : currentCardIndex + 1;
    setPendingCardIndex(newIndex);
  };
  
  // Retroceder para o card anterior
  const goToPrevCard = () => {
    // Evitar navegação durante pré-renderização
    if (interactionDisabled || !carouselRef.current) return;
    
    const cards = carouselRef.current.getCards();
    if (!cards || cards.length === 0) return;
    
    const newIndex = currentCardIndex === 0 ? cards.length - 1 : currentCardIndex - 1;
    setPendingCardIndex(newIndex);
  };
  
  // Ir para um card específico
  const goToCard = (index) => {
    // Permitir navegação programática durante pré-renderização
    // apenas se for chamado pelo componente de pré-renderização
    if (interactionDisabled && !downloadPreview.isPreRenderingActive()) return;
    
    if (!carouselRef.current) return;
    
    const cards = carouselRef.current.getCards();
    if (!cards || cards.length === 0) return;
    
    if (index >= 0 && index < cards.length) {
      // Em vez de chamar diretamente, definimos um estado pendente
      // que será processado no useEffect
      setPendingCardIndex(index);
    }
  };
  
  // Efeito para processar as mudanças de card de forma segura
  // evitando atualizações durante renderização
  useEffect(() => {
    if (isInitialized && pendingCardIndex !== null) {
      // Atualizar o estado interno primeiro
      setCurrentCardIndex(pendingCardIndex);
      
      // Usar setTimeout para garantir que o método não é chamado durante o ciclo de renderização
      const timeoutId = setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.goToCard(pendingCardIndex);
        }
        // Limpar o pendingCardIndex após o processamento
        setPendingCardIndex(null);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, pendingCardIndex]);
  
  // Obter o índice atual
  const getCurrentIndex = () => currentCardIndex;
  
  // Obter o número total de cards
  const getTotalCards = () => {
    if (!carouselRef.current) return 0;
    const cards = carouselRef.current.getCards();
    return cards ? cards.length : 0;
  };
  
  return (
    <CarouselControlContext.Provider 
      value={{
        registerCarousel,
        goToNextCard,
        goToPrevCard,
        goToCard,
        getCurrentIndex,
        getTotalCards,
        isInitialized,
        interactionDisabled
      }}
    >
      {children}
    </CarouselControlContext.Provider>
  );
};

/**
 * Componente HOC para conectar um carrossel ao controlador
 * @param {React.Component} WrappedComponent - Componente a ser conectado
 * @returns {React.Component} Componente conectado ao controlador
 */
export const withCarouselControl = (WrappedComponent) => {
  const WithCarouselControl = React.forwardRef((props, ref) => {
    const { registerCarousel, interactionDisabled } = useCarouselControl();
    
    // Usamos um useEffect para registrar o ref após a montagem
    // isso evita o erro de atualização durante renderização
    const innerRef = React.useRef(null);
    
    React.useEffect(() => {
      if (innerRef.current) {
        registerCarousel(innerRef.current);
      }
    }, [registerCarousel]);
    
    // Função para mesclar refs externos e internos
    const setRefs = (element) => {
      innerRef.current = element;
      
      // Também repassamos para o ref externo, se houver
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };
    
    // Passa a flag de desabilitação para o componente de carrossel
    return <WrappedComponent {...props} ref={setRefs} disableInteraction={interactionDisabled} />;
  });
  
  WithCarouselControl.displayName = `WithCarouselControl(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithCarouselControl;
};

/**
 * Exemplo de uso do controlador para animação automática
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element} Controlador de animação
 */
export const CarouselAutoPlayer = ({ 
  interval = 3000, 
  autoPlay = true,
  onComplete = () => {}
}) => {
  const { 
    goToNextCard, 
    getCurrentIndex, 
    getTotalCards, 
    isInitialized,
    interactionDisabled
  } = useCarouselControl();
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timerRef = useRef(null);
  
  // Iniciar reprodução automática
  const startAutoPlay = () => {
    // Não iniciar se a interação está desabilitada (pré-renderização em andamento)
    if (interactionDisabled) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      const currentIndex = getCurrentIndex();
      const totalCards = getTotalCards();
      
      if (currentIndex === totalCards - 1) {
        // Chegou ao último card, para a reprodução
        clearInterval(timerRef.current);
        setIsPlaying(false);
        onComplete();
      } else {
        goToNextCard();
      }
    }, interval);
  };
  
  // Parar reprodução automática
  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };
  
  // Se a interação for desabilitada, parar a reprodução
  useEffect(() => {
    if (interactionDisabled && isPlaying) {
      stopAutoPlay();
    } else if (!interactionDisabled && autoPlay && isInitialized && !isPlaying) {
      startAutoPlay();
    }
  }, [interactionDisabled, autoPlay, isInitialized, isPlaying]);
  
  // Espera pela inicialização e depois inicia a reprodução, se autoPlay estiver ativo
  useEffect(() => {
    if (isInitialized && autoPlay && !interactionDisabled) {
      startAutoPlay();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, isInitialized, interactionDisabled]);
  
  // Não renderiza nada, apenas controla
  return null;
};

export default CarouselControlProvider;