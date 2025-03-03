// steps/StepFour.js
import React, { useState } from 'react';
import CarouselPreview from '../previews/CarouselPreview';
import AlertMessage from '../common/AlertMessage';
import { FiCheckCircle, FiChevronLeft, FiRefreshCw, FiShare2, FiDownload, FiClipboard, FiCopy, FiSend } from 'react-icons/fi';
import styles from './StepFour.module.css';

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
  // Additional state for enhanced functionality
  const [sentStatus, setSentStatus] = useState({
    isSent: false,
    targetNumber: ''
  });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [justCopied, setJustCopied] = useState({
    template: false,
    phoneNumber: false
  });

  // Handle send template with status update
  const handleSendTemplate = () => {
    sendTemplate().then(() => {
      setSentStatus({
        isSent: true,
        targetNumber: phoneNumber
      });
    }).catch(error => {
      console.error('Error sending template:', error);
    });
  };

  // Reset the sent status to send to another number
  const handleSendToAnother = () => {
    setSentStatus({
      isSent: false,
      targetNumber: ''
    });
    setPhoneNumber('');
  };

  // Handle copy with visual feedback
  const handleCopy = (type) => {
    if (type === 'template') {
      copyToClipboard('sendTemplate');
    } else if (type === 'phoneNumber') {
      navigator.clipboard.writeText(phoneNumber);
    }

    setJustCopied({
      ...justCopied,
      [type]: true
    });

    setTimeout(() => {
      setJustCopied({
        ...justCopied,
        [type]: false
      });
    }, 2000);
  };

  // Export template as file
  const exportTemplate = () => {
    const fileContent = JSON.stringify(finalJson.sendTemplate, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName || 'whatsapp_template'}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to format phone number
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    
    // Basic formatting for readability
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) return cleaned;
    
    // Format as country code + area code + number
    const countryCode = cleaned.substring(0, 2);
    const areaCode = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9);
    
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2 className={styles.stepTitle}>Step 4: Template Delivery</h2>
        <p className={styles.stepDescription}>
          Your template is ready! Send it to WhatsApp for testing or share it with your team.
        </p>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>
              <FiCheckCircle />
            </span>
            Final Preview
          </h3>
          
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
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status:</span>
              <span className={`${styles.infoValue} ${styles.statusValue}`}>
                Ready for Submission
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.sendSection}>
          {!sentStatus.isSent ? (
            <>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  <FiSend />
                </span>
                Send Template for Testing
              </h3>
              
              <p className={styles.sendDescription}>
                Send your template directly to a WhatsApp number to preview it in action.
              </p>
              
              <div className={styles.sendForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    WhatsApp Number (with country code)
                  </label>
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
                  <p className={styles.inputHelp}>
                    Enter the complete number including country code (e.g., 5521999999999)
                  </p>
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
            </>
          ) : (
            <div className={styles.sentConfirmation}>
              <div className={styles.sentIcon}>
                <FiCheckCircle size={48} />
              </div>
              
              <h3 className={styles.sentTitle}>Template Sent Successfully!</h3>
              
              <p className={styles.sentMessage}>
                Your template has been sent to:
              </p>
              
              <div className={styles.phoneNumberDisplay}>
                <span>{formatPhoneForDisplay(sentStatus.targetNumber)}</span>
                <button 
                  className={styles.copyPhoneButton}
                  onClick={() => handleCopy('phoneNumber')}
                >
                  {justCopied.phoneNumber ? (
                    <FiCheckCircle size={16} />
                  ) : (
                    <FiCopy size={16} />
                  )}
                </button>
              </div>
              
              <p className={styles.sentHelp}>
                If you don't receive the message, please check that the number is valid 
                and that you've previously sent a message to your WhatsApp Business account.
              </p>
              
              <button 
                className={styles.sendAnotherButton}
                onClick={handleSendToAnother}
              >
                <FiRefreshCw />
                Send to another number
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.shareSection}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>
            <FiShare2 />
          </span>
          Share & Export Options
        </h3>
        
        <div className={styles.shareOptions}>
          <button 
            className={styles.shareButton}
            onClick={() => handleCopy('template')}
          >
            {justCopied.template ? (
              <>
                <FiCheckCircle />
                Copied!
              </>
            ) : (
              <>
                <FiClipboard />
                Copy JSON
              </>
            )}
          </button>
          
          <button 
            className={styles.shareButton}
            onClick={exportTemplate}
          >
            <FiDownload />
            Download JSON
          </button>
          
          <div 
            className={`${styles.shareOptionsExpand} ${showShareOptions ? styles.expanded : ''}`}
          >
            <button 
              className={styles.expandButton}
              onClick={() => setShowShareOptions(!showShareOptions)}
            >
              {showShareOptions ? 'Fewer options' : 'More options'}
            </button>
            
            {showShareOptions && (
              <div className={styles.expandedOptions}>
                <div className={styles.exportFormatSelector}>
                  <label className={styles.selectLabel}>Export Format:</label>
                  <select 
                    className={styles.formatSelect}
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <option value="json">JSON (API Ready)</option>
                    <option value="yaml">YAML</option>
                    <option value="csv">CSV (Template Info)</option>
                  </select>
                </div>
                
                <button className={styles.shareExtraButton}>
                  Email Template
                </button>
                
                <button className={styles.shareExtraButton}>
                  Create Documentation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.nextStepsSection}>
        <h3 className={styles.nextStepsTitle}>What's Next?</h3>
        
        <div className={styles.stepCards}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h4 className={styles.stepCardTitle}>Template Review Process</h4>
            <p className={styles.stepCardDescription}>
              Your template will be reviewed by Meta within 24-48 hours. You'll receive 
              an email notification once it's approved or if changes are needed.
            </p>
          </div>
          
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h4 className={styles.stepCardTitle}>Implementing in Your Application</h4>
            <p className={styles.stepCardDescription}>
              Use the template JSON in your application to programmatically send carousel 
              messages to your customers through the WhatsApp Business API.
            </p>
          </div>
          
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h4 className={styles.stepCardTitle}>Monitor Performance</h4>
            <p className={styles.stepCardDescription}>
              Track engagement and performance of your carousel template through the Blip 
              analytics dashboard to optimize your messaging strategy.
            </p>
          </div>
        </div>
      </div>
      
      <div className={styles.actionButtons}>
        <button 
          className={styles.backButton}
          onClick={() => setStep(3)}
        >
          <FiChevronLeft />
          Back
        </button>
        
        <button 
          className={styles.newTemplateButton}
          onClick={resetForm}
        >
          Create New Template
        </button>
      </div>
      
      {error && <AlertMessage error={error} />}
      {success && !sentStatus.isSent && <AlertMessage success={success} />}
    </div>
  );
};

export default StepFour;