// components/common/IntroductionGuide.js
import React, { useState } from 'react';
import { 
  FiInfo, 
  FiArrowRight, 
  FiUpload, 
  FiEdit3, 
  FiCheckCircle, 
  FiSend, 
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
        "icon": "<FiInfo size={28} />",
        "content": "Crie carrosséis interativos para o WhatsApp de forma simples e rápida. Siga este passo a passo para começar."
      },
      {
        "title": "1. Adicione arquivos",
        "icon": "<FiUpload size={28} />",
        "content": "Envie imagens ou vídeos para cada card do seu carrossel. Você pode adicionar até 10 cards, cada um com mídia e botões interativos."
      },
      {
        "title": "2. Personalize seu template",
        "icon": "<FiEdit3 size={28} />",
        "content": "Adicione textos e botões interativos a cada card. Você pode incluir até 2 botões por card, com ações como links ou respostas rápidas."
      },
      {
        "title": "3. Revise e teste seu carrossel",
        "icon": "<FiCheckCircle size={28} />",
        "content": "Seu template foi criado com sucesso! Agora, você pode visualizar a prévia, obter o código JSON ou enviá-lo para testes."
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
              Back
            </button>
          )}
          
          <button className={styles.nextButton} onClick={nextStep}>
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <FiChevronRight size={18} />
              </>
            ) : (
              <>
                Get Started
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