// components/WhatsAppCarouselCreator.js
import React, { useState, useEffect } from 'react';
import { useWhatsAppTemplateContext } from '../contexts/WhatsAppTemplateContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import ProgressHeader from './ui/ProgressHeader/ProgressHeader';
import IntroductionGuide from './ui/IntroductionGuide/IntroductionGuide';
import { FiArrowUp } from 'react-icons/fi';
import styles from './WhatsAppCarouselCreator.module.css';
import Footer from './ui/Footer/Footer';

/**
 * Componente principal para o aplicativo Criador de Carrossel do WhatsApp
 * Melhorado com UI/UX aprimorada com base no sistema de design
 * 
 * @returns {JSX.Element} Componente WhatsAppCarouselCreator
 */
const WhatsAppCarouselCreator = () => {
  // Obter contexto do template
  const templateContext = useWhatsAppTemplateContext();
  const { step, setStep, isStepValid, resetForm } = templateContext;
  
  // Estado local
  const [showGuide, setShowGuide] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Verificar se o guia de introdução foi mostrado antes
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('introductionGuideShown');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  // Monitorar posição de rolagem para mostrar/ocultar botão de rolar para o topo
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para rolar para o topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Alternar visibilidade das dicas
  const toggleTips = () => {
    setShowTips(!showTips);
    localStorage.setItem('showTips', String(!showTips));
  };

  // Marcar guia como mostrado
  const handleGuideClose = () => {
    setShowGuide(false);
    localStorage.setItem('introductionGuideShown', 'true');
  };

  // Renderizar etapa atual com base no estado
  const renderCurrentStep = () => {
    switch(step) {
      case 1:
        return <StepOne {...templateContext} />;
      case 2:
        return <StepTwo {...templateContext} showHints={showTips} />;
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
        <h1 className={styles.title}>Criador de Carrossel do WhatsApp</h1>
        <p className={styles.subtitle}>
          Crie templates interativos de carrossel para seu Router no Blip através de mensagens da API do WhatsApp Business
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
        <IntroductionGuide onClose={handleGuideClose} />
      )}

      <Footer />
    </div>
  );
};

export default WhatsAppCarouselCreator;
