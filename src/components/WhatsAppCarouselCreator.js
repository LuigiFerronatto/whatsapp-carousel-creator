// components/WhatsAppCarouselCreator.js
import React, { useState, useEffect } from 'react';
import { useWhatsAppTemplateContext } from '../contexts/WhatsAppTemplateContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import ProgressHeader from './common/ProgressHeader';
import IntroductionGuide from './common/IntroductionGuide';
import { FiArrowUp } from 'react-icons/fi';
import styles from './WhatsAppCarouselCreator.module.css';

const WhatsAppCarouselCreator = () => {
  const templateContext = useWhatsAppTemplateContext();
  const { step, setStep, isStepValid, resetForm } = templateContext;
  const [showGuide, setShowGuide] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Verificar se o guia já foi mostrado antes
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('introductionGuideShown');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  // Monitorar o scroll para mostrar/esconder o botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para rolar para o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Renderizar o passo atual
  const renderCurrentStep = () => {
    switch(step) {
      case 1:
        return <StepOne {...templateContext} />;
      case 2:
        return <StepTwo {...templateContext} />;
      case 3:
        return <StepThree {...templateContext} />;
      case 4:
        return <StepFour {...templateContext} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Criador de Carrossel para WhatsApp</h1>
        <p className={styles.subtitle}>
          Crie templates de carrossel interativos para suas mensagens do WhatsApp Business API
        </p>

        <ProgressHeader 
          step={step} 
          setStep={setStep} 
          isStepValid={isStepValid}
        />
      </div>
      
      <div className={styles.content}>
        {renderCurrentStep()}
      </div>
      
      <button 
        className={`${styles.scrollTopButton} ${showScrollTop ? styles.showScrollTop : ''}`}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
      >
        <FiArrowUp size={20} />
      </button>

      {showGuide && (
        <IntroductionGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};

export default WhatsAppCarouselCreator;