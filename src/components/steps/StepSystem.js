// components/steps/StepSystem.js
import React from 'react';
import { FiFileText, FiEdit, FiSend, FiCheck } from 'react-icons/fi';
import styles from './StepSystem.module.css';

/**
 * Progress indicator for the steps system
 * Shows user's current position in the workflow
 * 
 * @param {Object} props Component properties 
 * @param {number} props.currentStep Current step (1-3)
 * @param {Function} props.onStepClick Function called when a step is clicked
 * @param {Function} props.isStepNavigable Function that determines if a step can be navigated to
 * @returns {JSX.Element} StepSystem component
 */
const StepSystem = ({ 
  currentStep, 
  onStepClick,
  isStepNavigable
}) => {
  const steps = [
    { id: 1, label: 'Upload Media', icon: <FiFileText size={20} /> },
    { id: 2, label: 'Configure Cards', icon: <FiEdit size={20} /> },
    { id: 3, label: 'Review & Send', icon: <FiSend size={20} /> }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const handleStepClick = (stepId) => {
    if (isStepNavigable(stepId) && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className={styles.stepSystem}>
      <div className={styles.stepContainer}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isNavigable = isStepNavigable(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`
                  ${styles.step} 
                  ${styles[`step-${status}`]} 
                  ${!isNavigable ? styles.disabled : ''}
                `}
                onClick={() => handleStepClick(step.id)}
                role={isNavigable ? "button" : "presentation"}
                tabIndex={isNavigable ? 0 : -1}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                <div className={styles.stepIcon}>
                  {status === 'completed' ? <FiCheck size={20} /> : step.icon}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepNumber}>Step {step.id}</div>
                  <div className={styles.stepLabel}>{step.label}</div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`${styles.connector} ${currentStep > index + 1 ? styles.completed : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepSystem;