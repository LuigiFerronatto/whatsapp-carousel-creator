// components/WhatsAppCarouselCreator.js
import React from 'react';
import { useWhatsAppTemplateContext } from '../contexts/WhatsAppTemplateContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import ProgressHeader from './common/ProgressHeader';
import styles from './WhatsAppCarouselCreator.module.css';

const WhatsAppCarouselCreator = () => {
  const templateContext = useWhatsAppTemplateContext();
  const { step } = templateContext;

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
        <ProgressHeader step={step} />
      </div>
      
      {renderCurrentStep()}
    </div>
  );
};

export default WhatsAppCarouselCreator;