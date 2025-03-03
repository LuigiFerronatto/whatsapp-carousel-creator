// components/steps/StepThree.js
import React, { useState } from 'react';
import AlertMessage from '../common/AlertMessage';
import CarouselPreview from '../previews/CarouselPreview';
import { FiChevronLeft, FiChevronRight, FiCopy, FiCheck, FiSend, FiCode, FiEye, FiDownload, FiRefreshCw } from 'react-icons/fi';
import styles from './StepThree.module.css';

const StepThree = ({
  finalJson,
  copyToClipboard,
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
  templateName
}) => {
  const [activeView, setActiveView] = useState('visual');
  const [justCopied, setJustCopied] = useState({
    createTemplate: false,
    sendTemplate: false
  });
  const [sendStep, setSendStep] = useState(1);
  const [showApprovalInfo, setShowApprovalInfo] = useState(false);

  // Function to handle copy and show feedback
  const handleCopy = (jsonType) => {
    copyToClipboard(jsonType);
    setJustCopied({
      ...justCopied,
      [jsonType]: true
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setJustCopied({
        ...justCopied,
        [jsonType]: false
      });
    }, 2000);
  };

  // Function to download template JSON as file
  const downloadTemplate = (jsonType) => {
    const jsonContent = JSON.stringify(finalJson[jsonType], null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName}_${jsonType}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to handle sending template
  const handleSendTemplate = () => {
    sendTemplate();
    setSendStep(2);
  };

  // Function to toggle approval info
  const toggleApprovalInfo = () => {
    setShowApprovalInfo(!showApprovalInfo);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h2 className={styles.stepTitle}>Step 3: Template Created</h2>
        <p className={styles.stepDescription}>
          Your template has been created successfully. You can now send it for testing or copy the JSON for use in your application.
        </p>
      </div>
      
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
      
      <div className={styles.viewContent}>
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
          </div>
        )}
        
        {activeView === 'code' && (
          <div className={styles.codeView}>
            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <h3 className={styles.codeSectionTitle}>1. JSON for creating the template</h3>
                <div className={styles.codeActions}>
                  <button 
                    className={styles.codeActionButton}
                    onClick={() => downloadTemplate('createTemplate')}
                    title="Download JSON"
                  >
                    <FiDownload />
                  </button>
                  <button 
                    className={styles.codeActionButton}
                    onClick={() => handleCopy('createTemplate')}
                    title="Copy JSON"
                  >
                    {justCopied.createTemplate ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
              <div className={styles.codeContainer}>
                <pre className={styles.codeBlock}>
                  {JSON.stringify(finalJson.createTemplate, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <h3 className={styles.codeSectionTitle}>2. JSON for sending the template</h3>
                <div className={styles.codeActions}>
                  <button 
                    className={styles.codeActionButton}
                    onClick={() => downloadTemplate('sendTemplate')}
                    title="Download JSON"
                  >
                    <FiDownload />
                  </button>
                  <button 
                    className={styles.codeActionButton}
                    onClick={() => handleCopy('sendTemplate')}
                    title="Copy JSON"
                  >
                    {justCopied.sendTemplate ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
              <div className={styles.codeContainer}>
                <pre className={styles.codeBlock}>
                  {JSON.stringify(finalJson.sendTemplate, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'send' && (
          <div className={styles.sendView}>
            {sendStep === 1 ? (
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
                      className={styles.phoneInput}
                      value={phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.startsWith('+') ? e.target.value : '+' + e.target.value)}
                      placeholder="5521999999999"
                    />
                  </div>
                  <p className={styles.helpText}>Enter the full number with country code (e.g., 5521999999999)</p>
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
                
                <div className={styles.approvalInfoToggle}>
                  <button 
                    className={styles.infoToggleButton}
                    onClick={toggleApprovalInfo}
                  >
                    {showApprovalInfo ? 'Hide approval information' : 'Show approval information'}
                  </button>
                  
                  {showApprovalInfo && (
                    <div className={styles.approvalInfoBox}>
                      <h4>Template Approval Process</h4>
                      <ol className={styles.approvalSteps}>
                        <li>Templates are subject to Meta review before being approved</li>
                        <li>Approval usually takes 24-48 hours</li>
                        <li>Once approved, the template can be sent to any user who has messaged your number</li>
                        <li>Avoid promotional language and follow WhatsApp's guidelines for higher approval rates</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.sendResult}>
                <div className={styles.sendSuccessIcon}>
                  <FiCheck size={48} />
                </div>
                <h3 className={styles.sendSuccessTitle}>Template Sent Successfully!</h3>
                <p className={styles.sendSuccessMessage}>
                  Your template has been sent to <strong>{phoneNumber}</strong> for testing.
                </p>
                <p className={styles.sendSuccessNote}>
                  If you don't receive the message, please ensure the number is valid and has previously messaged your WhatsApp Business account.
                </p>
                
                <div className={styles.sendResultActions}>
                  <button 
                    className={styles.sendAgainButton}
                    onClick={() => setSendStep(1)}
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
      
      {error && <AlertMessage error={error} onClose={() => {}} />}
      {success && activeView !== 'send' && <AlertMessage success={success} onClose={() => {}} />}
    </div>
  );
};

export default StepThree;