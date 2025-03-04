// components/steps/StepThree.js (Modified)
import React, { useState } from 'react';
import AlertMessage from '../common/AlertMessage';
import CarouselPreview from '../previews/CarouselPreview';
import Button from '../ui/Button/Button';
import { 
  FiChevronLeft, 
  FiCopy, 
  FiCheck, 
  FiSend, 
  FiCode, 
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';
import styles from './StepThree.module.css';
import steps from '../../styles/Steps.module.css';

const StepThree = ({
  // Existing props
  finalJson,
  copyToClipboard,
  resetForm,
  error,
  success,
  cards,
  bodyText,
  setStep,
  templateName,
  
  // Step Four props
  phoneNumber,
  setPhoneNumber,
  sendTemplate,
  loading
}) => {
  // State
  const [activeView, setActiveView] = useState('visual');
  const [justCopied, setJustCopied] = useState({
    createTemplate: false,
    sendTemplate: false
  });
  const [sendSuccess, setSendSuccess] = useState(false);
  
  // Add new state for send functionality
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  // Handle copy with visual feedback
  const handleCopy = (jsonType) => {
    copyToClipboard(jsonType);
    setJustCopied({
      ...justCopied,
      [jsonType]: true
    });
    
    setTimeout(() => {
      setJustCopied({
        ...justCopied,
        [jsonType]: false
      });
    }, 2000);
  };

  // Send template functionality
  const handleSendTemplate = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      setIsPhoneValid(false);
      setPhoneError('Please enter a valid phone number');
      return;
    }
    
    try {
      await sendTemplate();
      setSendSuccess(true);
    } catch (err) {
      console.error('Error sending template:', err);
    }
  };

  // Send another template
  const handleSendAnother = () => {
    setSendSuccess(false);
    setPhoneNumber('');
  };

  // Format phone for display
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

  return (
    <div className={steps.container}>
      {/* Introduction section */}
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>Template Completed</h2>
        <p className={steps.stepDescription}>
          Your template has been created successfully. You can now preview it, get the JSON code, or send it for testing.
        </p>
      </div>
      
      {/* View tabs */}
      <div className={styles.viewTabs}>
        <button 
          className={`${styles.viewTab} ${activeView === 'visual' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('visual')}
        >
          <FiEye className={styles.tabIcon} />
          Visual Preview
        </button>
        <button 
          className={`${styles.viewTab} ${activeView === 'code' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('code')}
        >
          <FiCode className={styles.tabIcon} />
          JSON Code
        </button>
        <button 
          className={`${styles.viewTab} ${activeView === 'send' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('send')}
        >
          <FiSend className={styles.tabIcon} />
          Send Template
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className={styles.viewContent}>
        {/* Visual Preview Tab */}
        {activeView === 'visual' && (
          <div className={styles.visualPreview}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Template Preview</h3>
              <p className={styles.previewSubtitle}>This is how your carousel will appear in WhatsApp</p>
            </div>
            
            <div className={styles.previewContainer}>
              <CarouselPreview 
                cards={cards} 
                bodyText={bodyText} 
                contactName="WhatsApp Business"
              />
            </div>
            
            <div className={styles.templateInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Template Name:</span>
                <span className={styles.infoValue}>{templateName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cards:</span>
                <span className={styles.infoValue}>{cards.length}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Code View Tab - Existing functionality */}
        {activeView === 'code' && (
          <div className={styles.codeView}>
            {/* Existing code view implementation */}
          </div>
        )}
        
        {/* Send Template Tab - From Step Four */}
        {activeView === 'send' && (
          <div className={styles.sendView}>
            {!sendSuccess ? (
              <div className={styles.sendForm}>
                <h3 className={styles.sendTitle}>Send Template for Testing</h3>
                <p className={styles.sendDescription}>
                  Send your template directly to a WhatsApp number to test it before submission.
                </p>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>WhatsApp Number (with country code)</label>
                  <div className={styles.phoneInputWrapper}>
                    <span className={styles.phonePrefix}>+</span>
                    <input 
                      type="tel" 
                      className={`${styles.phoneInput} ${!isPhoneValid ? styles.inputError : ''}`}
                      value={phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.startsWith('+') ? e.target.value : '+' + e.target.value);
                        setIsPhoneValid(true);
                        setPhoneError('');
                      }}
                      placeholder="5521999999999"
                    />
                  </div>
                  {phoneError ? (
                    <p className={styles.errorText}>{phoneError}</p>
                  ) : (
                    <p className={styles.helpText}>Enter the full number with country code (e.g., 5521999999999)</p>
                  )}
                </div>
                
                <button 
                  className={styles.sendButton}
                  onClick={handleSendTemplate}
                  disabled={loading || !phoneNumber}
                >
                  {loading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Template
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className={styles.sendResult}>
                <div className={styles.sendSuccessIcon}>
                  <FiCheck size={48} />
                </div>
                <h3 className={styles.sendSuccessTitle}>Template Sent Successfully!</h3>
                <p className={styles.sendSuccessMessage}>
                  Your template has been sent to <strong>{formatPhoneDisplay(phoneNumber)}</strong> for testing.
                </p>
                <p className={styles.sendSuccessNote}>
                  If you don't receive the message, please ensure the number is valid and has previously messaged your WhatsApp Business account.
                </p>
                
                <div className={styles.sendResultActions}>
                  <button 
                    className={styles.sendAgainButton}
                    onClick={handleSendAnother}
                  >
                    <FiRefreshCw />
                    Send to Another Number
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className={styles.actionButtons}>
        <button 
          className={styles.backButton}
          onClick={() => setStep(2)}
        >
          <FiChevronLeft />
          Back to Editing
        </button>
        
        <button 
          className={styles.newTemplateButton}
          onClick={resetForm}
        >
          Create New Template
        </button>
      </div>
      
      {/* Error and success messages */}
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
    </div>
  );
};

export default StepThree;