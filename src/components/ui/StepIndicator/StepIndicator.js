// components/common/StepIndicator.js
import React from 'react';
import styles from './StepIndicator.module.css';

/**
 * Componente de indicador de etapas de formulário multi-passos
 * @param {Object} props - Propriedades do componente
 * @param {number} props.currentStep - Etapa atual do fluxo
 * @param {number} props.totalSteps - Número total de etapas
 * @param {Array<string>} props.stepLabels - Array com os rótulos de cada etapa
 * @returns {JSX.Element} Componente indicador de etapas
 */
const StepIndicator = ({ currentStep, totalSteps = 4, stepLabels = [] }) => {
  // Criar um array com o número total de etapas
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className={styles.container}>
      <div className={styles.stepsContainer}>
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <div key={step} className={styles.stepItem}>
              <div 
                className={`${styles.stepCircle} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              >
                {isCompleted ? (
                  <svg className={styles.checkIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < totalSteps && (
                <div 
                  className={`${styles.stepConnector} ${isCompleted ? styles.completed : ''}`}
                ></div>
              )}
              {stepLabels[step - 1] && (
                <div className={`${styles.stepLabel} ${isActive ? styles.activeLabel : ''}`}>
                  {stepLabels[step - 1]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;