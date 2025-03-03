// components/common/ProgressHeader.js
import React, { useCallback } from 'react';
import { FiUploadCloud, FiEdit, FiCheckCircle, FiSend } from 'react-icons/fi';
import styles from './ProgressHeader.module.css';

/**
 * Componente aprimorado para exibir o progresso através dos passos
 * Simplificado e otimizado para reutilização
 * 
 * @param {Object} props - Propriedades do componente
 * @param {number} props.step - Passo atual
 * @param {Function} props.setStep - Função para mudar o passo
 * @param {Function} props.isStepValid - Função para validar se pode avançar
 * @param {Array} props.steps - Array de passos personalizados (opcional)
 * @returns {JSX.Element} Componente de cabeçalho de progresso
 */
const ProgressHeader = ({ step, setStep, isStepValid, steps = null }) => {
  // Configuração padrão de etapas
  const defaultSteps = [
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

  // Usar etapas personalizadas ou padrão
  const stepsToShow = steps || defaultSteps;

  // Calcular porcentagem de progresso
  const progressPercentage = ((step - 1) / (stepsToShow.length - 1)) * 100;

  // Função para navegar para uma etapa específica
  const handleStepClick = useCallback((stepNumber) => {
    // Só permite ir para uma etapa se a anterior estiver válida
    // Ou se for para voltar para uma etapa anterior
    if (stepNumber < step || isStepValid(step)) {
      setStep(stepNumber);
    }
  }, [step, isStepValid, setStep]);

  return (
    <div className={styles.progressContainer}>
      {/* Barra de progresso */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progressPercentage}%` }}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progressPercentage}
          role="progressbar"
        ></div>
      </div>
      
      {/* Lista de etapas */}
      <div className={styles.stepsWrapper}>
        <div className={styles.stepsContainer}>
          {stepsToShow.map((stepItem) => {
            // Determinar o estado da etapa (ativa, concluída, pendente)
            const isActive = stepItem.number === step;
            const isCompleted = stepItem.number < step;
            const isPending = stepItem.number > step;
            
            // Classes dinâmicas com base no estado
            const stepClass = `
              ${styles.step} 
              ${isActive ? styles.activeStep : ''} 
              ${isCompleted ? styles.completedStep : ''} 
              ${isPending ? styles.pendingStep : ''}
            `.trim();
            
            return (
              <div 
                key={stepItem.number} 
                className={stepClass}
                onClick={() => handleStepClick(stepItem.number)}
                tabIndex={0}
                role="button"
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Passo ${stepItem.number}: ${stepItem.title}`}
              >
                <div 
                  className={styles.stepCircle}
                  style={{ backgroundColor: isActive || isCompleted ? stepItem.color : undefined }}
                >
                  {isCompleted ? (
                    <div className={styles.checkmark} aria-hidden="true">✓</div>
                  ) : (
                    <span className={styles.stepIcon} aria-hidden="true">
                      {stepItem.icon}
                    </span>
                  )}
                </div>
                
                <div className={styles.stepInfo}>
                  <div className={styles.stepTitle}>{stepItem.title}</div>
                  <div className={styles.stepDescription}>{stepItem.description}</div>
                </div>
                
                {stepItem.number < stepsToShow.length && (
                  <div className={styles.connector}>
                    <div 
                      className={`${styles.connectorLine} ${isCompleted ? styles.completedLine : ''}`}
                      style={{ borderColor: isCompleted ? stepItem.color : undefined }}
                      aria-hidden="true"
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