// components/steps/StepOne.js
import React, { useState, useEffect, useRef } from 'react';
import CardUploadInput from '../editors/CardUploadInput';
import AlertMessage from '../common/AlertMessage';
import Button from '../common/Button';
import { FiUpload, FiPlus, FiMinus, FiKey, FiArrowDown, FiSave, FiLink } from 'react-icons/fi';
import styles from './StepOne.module.css';

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
  const [authKeyVisible, setAuthKeyVisible] = useState(false);
  const [savedBeforeUpload, setSavedBeforeUpload] = useState(false);
  const [rememberKey, setRememberKey] = useState(() => {
    // Check if user previously chose to remember key
    return localStorage.getItem('remember_auth_key') === 'true';
  });
  const uploadSectionRef = useRef(null);
  const [showTips, setShowTips] = useState(true);

  // Effect to store auth key in local storage if remember option is checked
  useEffect(() => {
    if (rememberKey && authKey) {
      localStorage.setItem('auth_key', authKey);
      localStorage.setItem('remember_auth_key', 'true');
    } else if (!rememberKey) {
      localStorage.removeItem('auth_key');
      localStorage.setItem('remember_auth_key', 'false');
    }
  }, [rememberKey, authKey]);

  // Effect to load auth key from local storage on initial load
  useEffect(() => {
    if (rememberKey && !authKey) {
      const savedKey = localStorage.getItem('auth_key');
      if (savedKey) {
        setAuthKey(savedKey);
      }
    }
  }, [rememberKey, authKey, setAuthKey]);

  // Function to toggle auth key visibility
  const toggleAuthKeyVisibility = () => {
    setAuthKeyVisible(!authKeyVisible);
  };

  // Function to scroll to the cards section
  const scrollToUploadSection = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to handle save before upload
  const handleSaveBeforeUpload = () => {
    saveDraftManually();
    setSavedBeforeUpload(true);
    
    // Reset saved flag after 3 seconds
    setTimeout(() => {
      setSavedBeforeUpload(false);
    }, 3000);
  };

  // Function to check if all cards have valid URLs
  const allCardsHaveUrls = () => {
    return cards.slice(0, numCards).every(card => card.fileUrl?.trim());
  };

  return (
    <div className={styles.container}>
      <div className={styles.introSection}>
        <h2 className={styles.stepTitle}>Step 1: Configure Files</h2>
        <p className={styles.stepDescription}>
          In this step, you'll configure the images or videos that will be displayed in your WhatsApp carousel
          and provide the authorization key needed to upload the files.
        </p>
      </div>

      <div className={styles.authSection}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authIconContainer}>
              <FiKey size={24} />
            </div>
            <h3 className={styles.authTitle}>Authentication</h3>
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
                {authKeyVisible ? "Hide" : "Show"}
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
                This key is required for sending files and creating templates.
                You can find it in your Blip portal.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardsControlSection}>
        <div className={styles.controlHeader}>
          <h3 className={styles.controlTitle}>Card Configuration</h3>
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
                  <li>Recommended image size: 800×418 pixels</li>
                  <li>Use the same dimensions for all images for consistent display</li>
                  <li>Keep file sizes under 5MB for quicker loading</li>
                  <li>For videos, keep duration under 60 seconds</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Button to navigate to the cards section */}
        <button 
          className={styles.jumpToCardsButton}
          onClick={scrollToUploadSection}
          type="button"
        >
          View all cards <FiArrowDown size={14} />
        </button>
      </div>

      <div className={styles.importUrlsSection}>
        <button className={styles.bulkImportButton}>
          <FiLink size={16} />
          Import URLs from CSV/spreadsheet
        </button>
      </div>

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
      
      <div className={styles.actionSection}>
        <div className={styles.actionButtons}>
          <Button 
            variant="outline"
            color="content"
            size="medium"
            onClick={handleSaveBeforeUpload}
            iconLeft={<FiSave size={18} />}
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
            {loading ? 'Processing uploads...' : 'Send Files and Continue'}
          </Button>
        </div>
        
        {!authKey && (
          <p className={styles.validationMessage}>
            Please enter your authorization key before continuing.
          </p>
        )}
        
        {authKey && !allCardsHaveUrls() && (
          <p className={styles.validationMessage}>
            Add URLs for all cards before continuing.
          </p>
        )}
      </div>
      
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
      
      {uploadResults.length > 0 && (
        <div className={styles.uploadSummary}>
          <div className={styles.summaryTitle}>Upload summary:</div>
          <ul className={styles.summaryList}>
            {uploadResults.map((result, idx) => (
              <li key={idx} className={styles.summaryItem}>
                Card {idx + 1}: 
                <span className={result.status === 'success' ? styles.successStatus : styles.simulatedStatus}>
                  {result.status === 'success' ? ' Successfully uploaded' : ' Simulated for testing'}
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