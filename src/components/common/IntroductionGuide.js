// components/common/IntroductionGuide.js
import React, { useState, useEffect } from 'react';
import { FiX, FiChevronRight, FiChevronLeft, FiHelpCircle } from 'react-icons/fi';
import styles from './IntroductionGuide.module.css';

const IntroductionGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Efeito para animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Passos do tour guiado
  const steps = [
    {
      title: "Bem-vindo ao Criador de Carrossel para WhatsApp!",
      content: "Esta ferramenta permite criar templates de carrossel através das APIs da Blip para WhatsApp Business de forma simples e rápida. Vamos orientá-lo em cada etapa do processo.",
      image: "welcome.svg"
    },
    {
      title: "Passo 1: Configuração Inicial",
      content: "Na primeira etapa, você fornecerá sua chave de API (Router Key) e fará o upload das imagens ou vídeos para cada card do carrossel.",
      image: "step1.svg"
    },
    {
      title: "Passo 2: Personalização do Template",
      content: "Em seguida, você definirá o texto para cada card e configurará os botões que aparecerão no carrossel. Estes podem ser links, números de telefone ou respostas rápidas.",
      image: "step2.svg"
    },
    {
      title: "Passo 3: Finalização",
      content: "Por fim, você poderá visualizar o JSON do template pronto para ser usado na API do WhatsApp, e até mesmo enviar uma mensagem de teste diretamente para um número WhatsApp.",
      image: "step3.svg"
    },
    {
      title: "Dicas para aprovação rápida",
      content: "Lembre-se que todos os templates precisam ser aprovados pela Meta. Evite conteúdo promocional excessivo, siga as diretrizes e use mensagens claras para aumentar suas chances de aprovação.",
      image: "tips.svg"
    }
  ];

  // Navegar para o próximo passo
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  // Navegar para o passo anterior
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fechar o guia e salvar no localStorage
  const handleClose = () => {
    setIsVisible(false);
    
    // Após a animação de saída, chamar o callback de fechamento
    setTimeout(() => {
      localStorage.setItem('introductionGuideShown', 'true');
      onClose();
    }, 300);
  };

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Fechar guia">
          <FiX size={20} />
        </button>
        
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <div className={styles.image}>
              {/* Placeholder para imagem - no projeto real, usar imagens reais */}
              <div className={styles.placeholderImage}>
                {steps[currentStep].image.replace('.svg', '')}
              </div>
            </div>
          </div>
          
          <div className={styles.textContent}>
            <h3 className={styles.title}>{steps[currentStep].title}</h3>
            <p className={styles.description}>{steps[currentStep].content}</p>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.stepIndicator}>
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`${styles.dot} ${index === currentStep ? styles.activeDot : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          
          <div className={styles.buttons}>
            {currentStep > 0 && (
              <button 
                className={styles.backButton} 
                onClick={goToPreviousStep}
                aria-label="Passo anterior"
              >
                <FiChevronLeft size={18} />
                Anterior
              </button>
            )}
            
            <button 
              className={styles.nextButton} 
              onClick={goToNextStep}
              aria-label={currentStep < steps.length - 1 ? "Próximo passo" : "Concluir guia"}
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Próximo
                  <FiChevronRight size={18} />
                </>
              ) : (
                "Vamos começar!"
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Botão flutuante de ajuda que aparece após fechar o guia */}
      <button 
        className={`${styles.helpButton} ${!isVisible ? styles.showHelp : ''}`}
        onClick={() => setIsVisible(true)}
        aria-label="Abrir guia de ajuda"
      >
        <FiHelpCircle size={24} />
      </button>
    </div>
  );
};

export default IntroductionGuide;