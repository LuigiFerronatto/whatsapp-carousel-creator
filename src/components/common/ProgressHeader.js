// components/common/ProgressHeader.js
import React from 'react';
import { FiUploadCloud, FiEdit, FiCheckCircle, FiSend } from 'react-icons/fi';
import styles from './ProgressHeader.module.css';

const ProgressHeader = ({ step, setStep, isStepValid }) => {
  // Configuração das etapas
  const steps = [
    {
      number: 1,
      title: 'Configuração',
      description: 'Faça upload das mídias para o carrossel',
      icon: <FiUploadCloud size={20} />,
      color: 'var(--blip-action)'
    },
    {
      number: 2,
      title: 'Personalização',
      description: 'Configure textos e botões do template',
      icon: <FiEdit size={20} />,
      color: 'var(--mountain-meadow)'
    },
    {
      number: 3,
      title: 'Finalização',
      description: 'Obtenha o JSON final e teste o template',
      icon: <FiCheckCircle size={20} />,
      color: 'var(--buddha-gold)'
    },
    {
      number: 4,
      title: 'Envio',
      description: 'Envie o template para um número WhatsApp',
      icon: <FiSend size={20} />,
      color: 'var(--windsor)'
    }
  ];

  // Função para lidar com o clique em uma etapa
  const handleStepClick = (stepNumber) => {
    // Só permite ir para uma etapa se a anterior estiver válida
    // Ou se for para voltar para uma etapa anterior
    if (stepNumber < step || isStepValid(step)) {
      setStep(stepNumber);
    }
  };

  // Cálculo da porcentagem de progresso
  const progressPercentage = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className={styles.progressContainer}>
      {/* Barra de progresso */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Lista de etapas */}
      <div className={styles.stepsWrapper}>
        <div className={styles.stepsContainer}>
          {steps.map((stepItem) => {
            // Determinar o estado da etapa (ativa, concluída, pendente)
            const isActive = stepItem.number === step;
            const isCompleted = stepItem.number < step;
            const isPending = stepItem.number > step;
            
            // Determinar as classes com base no estado
            const stepClass = `${styles.step} ${isActive ? styles.activeStep : ''} ${isCompleted ? styles.completedStep : ''} ${isPending ? styles.pendingStep : ''}`;
            
            return (
              <div 
                key={stepItem.number} 
                className={stepClass}
                onClick={() => handleStepClick(stepItem.number)}
              >
                <div 
                  className={styles.stepCircle}
                  style={{ backgroundColor: isActive || isCompleted ? stepItem.color : undefined }}
                >
                  {isCompleted ? (
                    <div className={styles.checkmark}>✓</div>
                  ) : (
                    <span className={styles.stepIcon}>
                      {stepItem.icon}
                    </span>
                  )}
                </div>
                
                <div className={styles.stepInfo}>
                  <div className={styles.stepTitle}>{stepItem.title}</div>
                  <div className={styles.stepDescription}>{stepItem.description}</div>
                </div>
                
                {stepItem.number < steps.length && (
                  <div className={styles.connector}>
                    <div 
                      className={`${styles.connectorLine} ${isCompleted ? styles.completedLine : ''}`}
                      style={{ borderColor: isCompleted ? stepItem.color : undefined }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;