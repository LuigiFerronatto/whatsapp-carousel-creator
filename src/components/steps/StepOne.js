// components/steps/StepOne.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import Button from '../ui/Button/Button';
import { 
  FiUpload, 
  FiPlus, 
  FiMinus, 
  FiKey, 
  FiArrowDown, 
  FiSave, 
  FiInfo, 
  FiEye, 
  FiEyeOff,
  FiCheckCircle
} from 'react-icons/fi';
import styles from './StepOne.module.css';
import steps from '../../styles/Steps.module.css';

/**
 * StepOne - Initial step for file configuration
 * Enhanced with better UI/UX based on the design system
 * 
 * @param {Object} props Component properties
 * @returns {JSX.Element} StepOne component
 */
const StepOne = ({ 
  authKey, 
  setAuthKey, 
  numCards, 
  cards, 
  updateCard, 
  handleAddCard, 
  handleRemoveCard, 
  handleUploadFiles, 
  loading, 
  error, 
  success, 
  uploadResults,
  isStepValid,
  saveDraftManually
}) => {
  // Local state
  const [authKeyVisible, setAuthKeyVisible] = useState(false);
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [rememberKey, setRememberKey] = useState(() => {
    return localStorage.getItem('remember_auth_key') === 'true';
  });
  const [showTips, setShowTips] = useState(true);
  
  // Refs
  const uploadSectionRef = useRef(null);
  
  // Handle auth key in localStorage
  useEffect(() => {
    if (rememberKey && authKey) {
      localStorage.setItem('auth_key', authKey);
      localStorage.setItem('remember_auth_key', 'true');
    } else if (!rememberKey) {
      localStorage.removeItem('auth_key');
      localStorage.setItem('remember_auth_key', 'false');
    }
  }, [rememberKey, authKey]);
  
  // Load auth key from localStorage
  useEffect(() => {
    if (rememberKey && !authKey) {
      const savedKey = localStorage.getItem('auth_key');
      if (savedKey) {
        setAuthKey(savedKey);
      }
    }
  }, [rememberKey, authKey, setAuthKey]);
  
  // Toggle auth key visibility
  const toggleAuthKeyVisibility = useCallback(() => {
    setAuthKeyVisible(!authKeyVisible);
  }, [authKeyVisible]);
  
  // Scroll to upload section
  const scrollToUploadSection = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  // Save draft before upload
  const handleSaveBeforeUpload = useCallback(() => {
    saveDraftManually();
    setSavedBeforeUpload(true);
    
    setTimeout(() => {
      setSavedBeforeUpload(false);
    }, 3000);
  }, [saveDraftManually]);
  
  // Check if all cards have valid URLs
  const allCardsHaveUrls = useCallback(() => {
    return cards.slice(0, numCards).every(card => card.fileUrl?.trim());
  }, [cards, numCards]);

  return (
    <div className={steps.container}>
      {/* Introduction section */}
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>File Configuration</h2>
        <p className={steps.stepDescription}>
          In this step, you'll configure the images or videos to be displayed in your WhatsApp carousel
          and provide the authorization key required to upload the files.
        </p>
      </div>

      {/* Authentication section */}
      <div className={styles.authSection}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authIconContainer}>
              <FiKey size={24} />
            </div>
            <h3>Authentication</h3>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Authorization Key (Router Key)</label>
            <div className={styles.authInputContainer}>
              <input 
                type={authKeyVisible ? "text" : "password"}
                className={styles.input}
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                placeholder="Key=xxxxxxxxx"
              />
              <button 
                className={styles.visibilityToggle}
                onClick={toggleAuthKeyVisibility}
                type="button"
                aria-label={authKeyVisible ? "Hide key" : "Show key"}
              >
                {authKeyVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                <span>{authKeyVisible ? "Hide" : "Show"}</span>
              </button>
            </div>
            <div className={styles.authOptions}>
              <label className={styles.rememberKeyLabel}>
                <input 
                  type="checkbox" 
                  className={styles.rememberKeyCheckbox}
                  checked={rememberKey}
                  onChange={(e) => setRememberKey(e.target.checked)}
                />
                Remember my key
              </label>
              <p className={styles.helpText}>
                This key is required to send files and create templates.
                You can find it in the Blip portal.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card controls section */}
      <div className={styles.cardsControlSection}>
        <div className={styles.controlHeader}>
          <h3>Card Configuration</h3>
          <div className={styles.cardCounter}>
            <span className={styles.cardCountLabel}>Number of cards:</span>
            <div className={styles.buttonGroup}>
              <button 
                onClick={handleRemoveCard}
                disabled={numCards <= 2}
                className={styles.controlButton}
                aria-label="Remove card"
              >
                <FiMinus size={18} />
              </button>
              <span className={styles.cardCount}>{numCards}</span>
              <button 
                onClick={handleAddCard}
                disabled={numCards >= 10}
                className={styles.controlButton}
                aria-label="Add card"
              >
                <FiPlus size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.cardControlOptions}>
          <p className={styles.cardControlHelp}>
            A carousel needs at least 2 and at most 10 cards. Each card will have an image or video and interactive buttons.
          </p>
          
          <div className={styles.cardTipsContainer}>
            <button 
              className={styles.tipsToggle}
              onClick={() => setShowTips(!showTips)}
            >
              {showTips ? "Hide tips" : "Show tips"}
            </button>
            
            {showTips && (
              <div className={styles.cardTips}>
                <h4>Best practices for carousel images:</h4>
                <ul>
                  <li>Recommended size: 800×418 pixels</li>
                  <li>Use the same dimensions for all images for consistent display</li>
                  <li>Keep files under 5MB for fast loading</li>
                  <li>For videos, keep duration under 60 seconds</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline"
          color="primary"
          onClick={scrollToUploadSection}
          iconRight={<FiArrowDown size={14} />}
          className={styles.jumpToCardsButton}
        >
          View all cards
        </Button>
      </div>
      
      {/* Card upload grid */}
      <div className={styles.cardsGrid} ref={uploadSectionRef}>
        {cards.slice(0, numCards).map((card, index) => (
          <CardUploadInput 
            key={index} 
            index={index} 
            card={card} 
            updateCard={updateCard}
            totalCards={numCards}
          />
        ))}
      </div>
      
      {/* Action buttons */}
      <div className={styles.actionSection}>
        <div className={styles.actionButtons}>
          <Button 
            variant="outline"
            color="content"
            size="large"
            onClick={handleSaveBeforeUpload}
            iconLeft={savedBeforeUpload ? <FiCheckCircle size={18} /> : <FiSave size={18} />}
            className={styles.saveButton}
          >
            {savedBeforeUpload ? 'Saved!' : 'Save Draft'}
          </Button>
          
          <Button 
            variant="solid"
            color="primary"
            size="large"
            loading={loading}
            disabled={!isStepValid(1) || loading}
            iconLeft={loading ? null : <FiUpload size={18} />}
            onClick={handleUploadFiles}
            className={styles.uploadButton}
          >
            {loading ? 'Processing uploads...' : 'Upload Files & Continue'}
          </Button>
        </div>
        
        {!authKey && (
          <div className={styles.validationMessage}>
            <FiInfo size={16} />
            Add your authorization key before continuing.
          </div>
        )}
        
        {authKey && !allCardsHaveUrls() && (
          <div className={styles.validationMessage}>
            <FiInfo size={16} />
            Add URLs for all cards before continuing.
          </div>
        )}
      </div>
      
      {/* Error and success messages */}
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
      
      {/* Upload summary */}
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>Upload summary:</div>
          <ul className={styles.summaryList}>
            {uploadResults.map((result, idx) => (
              <li key={idx} className={styles.summaryItem}>
                Card {idx + 1}: 
                <span className={result.status === 'success' ? styles.successStatus : styles.simulatedStatus}>
                  {result.status === 'success' ? ' Upload successful' : ' Simulated for testing'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StepOne;