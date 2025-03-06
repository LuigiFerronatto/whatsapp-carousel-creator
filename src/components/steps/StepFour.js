// components/steps/StepFour.js
import React, { useState } from 'react';
import CarouselPreview from '../previews/CarouselPreview';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import Button from '../ui/Button/Button';
import StatusMessage from '../common/StatusMessage';
import { FiChevronLeft, FiCheck, FiSend, FiDownload, FiCopy, FiRefreshCw } from 'react-icons/fi';
import styles from './StepFour.module.css';
import steps from '../../styles/Steps.module.css';

/**
 * StepFour - Etapa final para envio do template
 * Componente refatorado para maior simplicidade e melhor UX
 */
const StepFour = ({
  finalJson,
  phoneNumber,
  setPhoneNumber,
  sendTemplate,
  resetForm,
  error,
  success,
  loading,
  cards,
  bodyText,
  setStep,
  templateName,
  copyToClipboard
}) => {
  // Estados locais simplificados
  const [sentStatus, setSentStatus] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Formatar telefone para exibição
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) return phone;
    
    const countryCode = cleaned.substring(0, 2);
    const areaCode = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9);
    
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  };

  // Função simplificada para envio com acompanhamento de status
  const handleSendTemplate = async () => {
    try {
      await sendTemplate();
      setSentStatus(true);
    } catch (error) {
      console.error("Erro ao enviar template:", error);
    }
  };

  // Reiniciar o status para enviar para outro número
  const handleSendToAnother = () => {
    setSentStatus(false);
    setPhoneNumber('');
  };

  // Copiar JSON com feedback visual
  const handleCopy = () => {
    copyToClipboard('sendTemplate');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Download do JSON como arquivo
  const handleDownload = () => {
    const jsonContent = JSON.stringify(finalJson.sendTemplate, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName || 'whatsapp_template'}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Limpeza
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (

   <div className={steps.container}>
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>Envio do Template</h2>
        <p className={steps.stepDescription}>
          Seu template está pronto! Envie para um número WhatsApp para testar ou baixe o JSON para usar em sua aplicação.
        </p>
      </div>
      
      <div className={styles.contentWrapper}>
        {/* Coluna de Visualização */}
        <div className={styles.previewSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Visualização Final</h3>
          </div>
          
          <div className={styles.previewContainer}>
            <CarouselPreview 
              cards={cards} 
              bodyText={bodyText}
            />
          </div>
          
          <div className={styles.templateInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Template:</span>
              <span className={styles.infoValue}>{templateName}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Cards:</span>
              <span className={styles.infoValue}>{cards.length}</span>
            </div>
          </div>
          
          <div className={styles.actionsContainer}>
            <Button 
              variant="outline" 
              color="content"
              onClick={handleCopy}
              iconLeft={copySuccess ? <FiCheck /> : <FiCopy />}
            >
              {copySuccess ? 'Copiado!' : 'Copiar JSON'}
            </Button>
            
            <Button 
              variant="outline" 
              color="content"
              onClick={handleDownload}
              iconLeft={<FiDownload />}
            >
              Download JSON
            </Button>
          </div>
        </div>
        
        {/* Coluna de Envio */}
        <div className={styles.sendSection}>
          {!sentStatus ? (
            <>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Testar Envio</h3>
              </div>
              
              <p className={styles.sendDescription}>
                Envie seu template para um número WhatsApp para visualizá-lo em ação
              </p>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Número com código do país</label>
                <div className={styles.phoneInputWrapper}>
                  <span className={styles.phonePrefix}>+</span>
                  <input 
                    type="tel" 
                    className={styles.phoneInput}
                    value={phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.startsWith('+') ? e.target.value : '+' + e.target.value)}
                    placeholder="5521999999999"
                  />
                </div>
                <span className={styles.inputHelp}>
                  Número completo com código do país (ex: 5521999999999)
                </span>
              </div>
              
              <div className={styles.sendButtonContainer}>
                <Button 
                  variant="solid"
                  color="primary"
                  onClick={handleSendTemplate}
                  disabled={!phoneNumber || loading}
                  loading={loading}
                  iconLeft={<FiSend />}
                  fullWidth
                >
                  Enviar Template
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <FiCheck size={40} />
              </div>
              
              <h3 className={styles.successTitle}>Template Enviado!</h3>
              
              <p className={styles.successMessage}>
                Template enviado com sucesso para:
              </p>
              
              <div className={styles.phoneDisplay}>
                {formatPhoneDisplay(phoneNumber)}
              </div>
              
              <p className={styles.successNote}>
                Se não receber o template, verifique se o número está correto e se já enviou mensagem para sua conta WhatsApp Business.
              </p>
              
              <Button 
                variant="outline"
                color="primary"
                onClick={handleSendToAnother}
                iconLeft={<FiRefreshCw />}
              >
                Enviar para outro número
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.navigationButtons}>
        <Button 
          variant="outline"
          color="content"
          onClick={() => setStep(3)}
          iconLeft={<FiChevronLeft />}
        >
          Voltar
        </Button>
        
        <Button 
          variant="solid"
          color="primary"
          onClick={resetForm}
        >
          Criar Novo Template
        </Button>
      </div>
      
      {error && <AlertMessage error={error} />}
      {success && !sentStatus && <AlertMessage success={success} />}
    </div>
  );
};

export default StepFour;