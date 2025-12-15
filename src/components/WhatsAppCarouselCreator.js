// components/WhatsAppCarouselCreator.js
import React, { useState, useEffect } from 'react';
import { useWhatsAppTemplateContext } from '../contexts/WhatsAppTemplateContext';
import StepOne from './steps/StepOne';
import StepTwo from './steps/StepTwo';
import StepThree from './steps/StepThree';
import ProgressHeader from './ui/ProgressHeader/ProgressHeader';
import IntroductionGuide from './ui/IntroductionGuide/IntroductionGuide';
import { FiArrowUp } from 'react-icons/fi';
import styles from './WhatsAppCarouselCreator.module.css';
import Footer from './ui/Footer/Footer';

/**
 * Main component for the WhatsApp Carousel Creator app
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

  // Check if tips should be shown based on user preference
  useEffect(() => {
    const tipsPreference = localStorage.getItem('showTips');
    if (tipsPreference !== null) {
      setShowTips(tipsPreference === 'true');
    }
  }, []);

  // Monitor scroll position to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to top
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
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>WhatsApp Carousel Creator</h1>
        <p className={styles.subtitle}>
          Create interactive carousel templates for your Blip Router through WhatsApp Business API messages
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

      <Footer />
    </div>
  );
};

export default WhatsAppCarouselCreator;