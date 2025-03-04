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
      title: 'Welcome to WhatsApp Carousel Creator',
      icon: <FiInfo size={28} />,
      content: 'This tool helps you create interactive carousel templates for WhatsApp Business API. Follow this quick guide to learn how it works.'
    },
    {
      title: '1. File Configuration',
      icon: <FiUpload size={28} />,
      content: 'First, you\'ll upload images or videos for each card in your carousel. You can add up to 10 cards, each with its own media and interactive buttons.'
    },
    {
      title: '2. Template Creation',
      icon: <FiEdit3 size={28} />,
      content: 'Next, you\'ll configure your template with text content and interactive buttons. Each card can have up to 2 buttons with different action types like links and quick replies.'
    },
    {
      title: '3. Template Review',
      icon: <FiCheckCircle size={28} />,
      content: 'Preview your carousel and generate the template JSON. You can download or copy this JSON for use in your WhatsApp Business API integration.'
    },
    {
      title: '4. Send Template',
      icon: <FiSend size={28} />,
      content: 'Finally, you can test your template by sending it to a WhatsApp number. This helps you see how it will appear to your customers.'
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