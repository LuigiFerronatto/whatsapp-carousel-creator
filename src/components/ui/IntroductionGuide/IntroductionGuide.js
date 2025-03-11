// components/common/IntroductionGuide.js
import React, { useState } from 'react';
import { 
  FiInfo, 
  FiArrowRight, 
  FiUpload, 
  FiEdit3, 
  FiCheckCircle, 
  FiTarget, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight 
} from 'react-icons/fi';
import styles from './IntroductionGuide.module.css';

/**
 * Introduction guide component shown to first-time users
 * Provides a step-by-step walkthrough of the application
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onClose Function called when guide is closed
 * @returns {JSX.Element} IntroductionGuide component
 */
const IntroductionGuide = ({ onClose }) => {
  // Current step in the guide
  const [currentStep, setCurrentStep] = useState(0);
  
  // Guide steps data
  const steps = [
    {
      "title": "Bem-vindo ao Criador de Carrosséis do WhatsApp",
      "icon": <FiInfo size={28} />,
      "content": "Crie carrosséis interativos para o WhatsApp de forma simples e rápida. Este guia passo a passo ajudará você a começar."
    },
    {
      "title": "1. Adicione seus arquivos",
      "icon": <FiUpload size={28} />,
      "content": <>Envie imagens ou vídeos para cada card do seu carrossel. Você pode adicionar até <strong>10 cards</strong>, cada um com mídia e botões interativos.</>
    },
    {
      "title": "2. Personalize seu carrossel",
      "icon": <FiEdit3 size={28} />,
      "content": <>Adicione textos e botões interativos a cada card. Inclua até <strong>2 botões por card</strong>, com ações como links ou respostas rápidas.</>
    },
    {
      "title": "3. Teste e finalize",
      "icon": <FiCheckCircle size={28} />,
      "content": <><strong>Seu carrossel está pronto!</strong> Visualize a prévia, obtenha o código JSON ou envie para testes.</>
    },
    {
      "title": "Por que criei isso?",
      "icon": <FiTarget size={28} />,
      "content": <>Como a <strong>Meta</strong> e a <strong>Blip</strong> ainda não liberaram uma interface de criação de carrosséis, tudo tinha que ser feito através de APIs, o que era muito trabalhoso.</>
    }
  ];
  
  // Move to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  // Move to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Get current step data
  const currentStepData = steps[currentStep];
  
  return (
    <div className={styles.overlay}>
      <div className={styles.guideContainer}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close guide">
          <FiX size={24} />
        </button>
        
        <div className={styles.guideContent}>
          <div className={styles.iconContainer}>
            {currentStepData.icon}
          </div>
          
          <h2 className={styles.guideTitle}>{currentStepData.title}</h2>
          
          <p className={styles.guideText}>{currentStepData.content}</p>
          
          <div className={styles.progressIndicator}>
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`${styles.progressDot} ${index === currentStep ? styles.activeDot : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
        </div>
        
        <div className={styles.guideActions}>
          {currentStep > 0 && (
            <button className={styles.backButton} onClick={prevStep}>
              <FiChevronLeft size={18} />
              Voltar
            </button>
          )}
          
          <button className={styles.nextButton} onClick={nextStep}>
            {currentStep < steps.length - 1 ? (
              <>
                Continuar
                <FiChevronRight size={18} />
              </>
            ) : (
              <>
                Vamos lá!
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionGuide;