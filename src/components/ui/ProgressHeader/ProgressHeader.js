// components/common/ProgressHeader.js
import React from 'react';
import { FiUpload, FiEdit3, FiCheckCircle, FiSend } from 'react-icons/fi';
import styles from './ProgressHeader.module.css';

/**
 * Enhanced ProgressHeader component showing the workflow steps
 * 
 * @param {Object} props Component properties
 * @param {number} props.step Current active step
 * @param {Function} props.setStep Function to change the current step
 * @param {Function} props.isStepValid Function to check if a step is valid
 * @returns {JSX.Element} ProgressHeader component
 */
const ProgressHeader = ({ step, setStep, isStepValid }) => {
  // Step configuration data
  const steps = [
    {
      id: 1,
      name: 'File Configuration',
      icon: <FiUpload />,
      description: 'Upload files and configure card media'
    },
    {
      id: 2,
      name: 'Template Creation',
      icon: <FiEdit3 />,
      description: 'Configure template text and buttons'
    },
    {
      id: 3,
      name: 'Template Review',
      icon: <FiCheckCircle />,
      description: 'Review and generate template JSON'
    },
    {
      id: 4,
      name: 'Send Template',
      icon: <FiSend />,
      description: 'Send the template for testing'
    }
  ];

  // Handle navigation to a step
  const handleStepClick = (stepNumber) => {
    // Allow navigation only to completed steps or next available step
    if (stepNumber < step || (stepNumber === step + 1 && isStepValid(step))) {
      setStep(stepNumber);
    }
  };

  // Get step status (whether it's completed, active, or upcoming)
  const getStepStatus = (stepNumber) => {
    if (stepNumber < step) return 'completed';
    if (stepNumber === step) return 'active';
    if (stepNumber === step + 1 && isStepValid(step)) return 'next';
    return 'upcoming';
  };

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
      
      <div className={styles.stepsContainer}>
        {steps.map((s) => {
          const status = getStepStatus(s.id);
          return (
            <div 
              key={s.id} 
              className={`${styles.step} ${styles[status]}`}
              onClick={() => handleStepClick(s.id)}
            >
              <div className={styles.stepNumber}>
                {status === 'completed' ? (
                  <FiCheckCircle className={styles.checkIcon} />
                ) : (
                  <span>{s.id}</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepName}>
                  {s.icon && <span className={styles.stepIcon}>{s.icon}</span>}
                  {s.name}
                </div>
                <div className={styles.stepDescription}>{s.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressHeader;