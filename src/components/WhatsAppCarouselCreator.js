// components/WhatsAppCarouselCreator.js
import React, { useState, useEffect } from 'react';
import { useWhatsAppTemplateContext } from '../contexts/WhatsAppTemplateContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import StepFour from './steps/StepFour';
import ProgressHeader from './common/ProgressHeader';
import IntroductionGuide from './common/IntroductionGuide';
import { FiArrowUp, FiInfo } from 'react-icons/fi';
import styles from './WhatsAppCarouselCreator.module.css';

/**
 * Main component for the WhatsApp Carousel Creator application
 * Enhanced with improved UI/UX based on the design system
 * 
 * @returns {JSX.Element} WhatsAppCarouselCreator component
 */
const WhatsAppCarouselCreator = () => {
  // Get template context
  const templateContext = useWhatsAppTemplateContext();
  const { step, setStep, isStepValid, resetForm } = templateContext;
  
  // Local state
  const [showGuide, setShowGuide] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Check if introduction guide has been shown before
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('introductionGuideShown');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  // Monitor scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Toggle tips visibility
  const toggleTips = () => {
    setShowTips(!showTips);
    localStorage.setItem('showTips', String(!showTips));
  };

  // Mark guide as shown
  const handleGuideClose = () => {
    setShowGuide(false);
    localStorage.setItem('introductionGuideShown', 'true');
  };

  // Render current step based on state
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
        <h1 className={styles.title}>WhatsApp Carousel Creator</h1>
        <p className={styles.subtitle}>
          Create interactive carousel templates for your WhatsApp Business API messages
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
        aria-label="Back to top"
      >
        <FiArrowUp size={20} />
      </button>

      {showGuide && (
        <IntroductionGuide onClose={handleGuideClose} />
      )}


<footer className={styles.footer}>
        <p>WhatsApp Carousel Creator © {new Date().getFullYear()}</p>
        <p>Developed By: Luigi Ferronatto</p>
      </footer>


    </div>
  );
};

export default WhatsAppCarouselCreator;