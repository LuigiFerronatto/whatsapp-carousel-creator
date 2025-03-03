// components/common/IntroductionGuide.js
import React, { useState, useEffect } from 'react';
import { FiX, FiChevronRight, FiChevronLeft, FiHelpCircle, FiInfo } from 'react-icons/fi';
import Button from './Button';
import styles from './IntroductionGuide.module.css';

/**
 * Introduction Guide component that shows a step-by-step tutorial
 * @param {Object} props - Component properties
 * @param {Function} props.onClose - Function to call when the guide is closed
 * @param {Array} props.steps - Array of steps for the guide
 * @param {boolean} props.showFloatingHelp - Whether to show the floating help button after closing
 * @returns {JSX.Element} Introduction guide component
 */
const IntroductionGuide = ({ onClose, steps: customSteps, showFloatingHelp = true }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Default steps for the guide
  const defaultSteps = [
    {
      title: "Welcome to WhatsApp Carousel Creator!",
      content: "This tool allows you to create carousel templates through Blip APIs for WhatsApp Business quickly and easily. We'll guide you through each step of the process.",
      image: "welcome"
    },
    {
      title: "Step 1: Initial Setup",
      content: "In the first step, you will provide your API key (Router Key) and upload images or videos for each card in the carousel.",
      image: "step1"
    },
    {
      title: "Step 2: Template Customization",
      content: "Next, you'll define the text for each card and configure the buttons that will appear in the carousel. These can be links, phone numbers, or quick replies.",
      image: "step2"
    },
    {
      title: "Step 3: Finalization",
      content: "Finally, you'll be able to view the JSON of the template ready to be used in the WhatsApp API, and even test it by sending a message directly to a WhatsApp number.",
      image: "step3"
    },
    {
      title: "Tips for quick approval",
      content: "Remember that all templates need to be approved by Meta. Avoid excessive promotional content, follow the guidelines, and use clear messages to increase your chances of approval.",
      image: "tips"
    }
  ];
  
  // Use custom steps if provided, otherwise use default steps
  const steps = customSteps || defaultSteps;

  // Effect for entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Go to next step
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Close the guide and save to localStorage
  const handleClose = () => {
    setIsVisible(false);
    
    // After the exit animation, call the close callback
    setTimeout(() => {
      localStorage.setItem('introductionGuideShown', 'true');
      onClose();
    }, 300);
  };

  // Show the guide again when the help button is clicked
  const handleShowGuide = () => {
    setIsVisible(true);
  };

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close guide">
          <FiX size={20} />
        </button>
        
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <div className={styles.image}>
              {/* Placeholder for image - in a real project, use real images */}
              <div className={styles.placeholderImage}>
                <FiInfo size={32} />
                <div className={styles.imageText}>{steps[currentStep].image}</div>
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
              <Button 
                variant="outline"
                color="content"
                onClick={goToPreviousStep}
                iconLeft={<FiChevronLeft />}
                className={styles.navigationButton}
              >
                Previous
              </Button>
            )}
            
            <Button 
              variant="solid"
              color="primary"
              onClick={goToNextStep}
              iconRight={currentStep < steps.length - 1 ? <FiChevronRight /> : null}
              className={styles.navigationButton}
            >
              {currentStep < steps.length - 1 ? "Next" : "Let's Start!"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating help button that appears after closing the guide */}
      {showFloatingHelp && (
        <button 
          className={`${styles.helpButton} ${!isVisible ? styles.showHelp : ''}`}
          onClick={handleShowGuide}
          aria-label="Open help guide"
        >
          <FiHelpCircle size={24} />
        </button>
      )}
    </div>
  );
};

export default IntroductionGuide;