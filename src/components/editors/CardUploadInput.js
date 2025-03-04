// components/editors/CardUploadInput.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import Button from '../ui/Button/Button';
import { 
  FiImage, 
  FiVideo, 
  FiUploadCloud, 
  FiLink, 
  FiCheck, 
  FiAlertCircle, 
  FiX,
  FiExternalLink,
  FiTrendingUp
} from 'react-icons/fi';
import styles from './CardUploadInput.module.css';

/**
 * Enhanced component for uploading or selecting URL for each carousel card
 * 
 * @param {Object} props Component properties
 * @param {number} props.index Card index
 * @param {Object} props.card Card data
 * @param {Function} props.updateCard Function to update card data
 * @param {number} props.totalCards Total number of cards
 * @returns {JSX.Element} CardUploadInput component
 */
const CardUploadInput = ({ index, card, updateCard, totalCards }) => {
  // Local state
  const [uploadMethod, setUploadMethod] = useState('url');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  
  // Refs
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Custom hook for file upload
  const { 
    uploadToAzure, 
    isUploading, 
    uploadError, 
    uploadedFile, 
    resetUpload 
  } = useFileUpload();

  // Update preview when card URL changes
  useEffect(() => {
    if (card.fileUrl) {
      setPreviewUrl(card.fileUrl);
      setUrlValidationError('');
    } else {
      setPreviewUrl('');
    }
  }, [card.fileUrl]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Determine file type (image or video)
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      updateCard(index, 'fileType', fileType);
      
      // Create temporary local preview
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      
      // Upload to Azure
      const uploadResult = await uploadToAzure(file);

      // Update card with blob URL
      updateCard(index, 'fileUrl', uploadResult.url);
      updateCard(index, 'fileType', uploadResult.type);
      updateCard(index, 'fileHandle', uploadResult.name || `file-${Date.now()}`);
      
      // Clean up the temporary preview
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [index, updateCard, uploadToAzure]);

  // Open file selector
  const handleFileInputClick = useCallback(() => {
    resetUpload();
    fileInputRef.current?.click();
  }, [resetUpload]);

  // URL validation
  const validateUrl = useCallback((url) => {
    if (!url) {
      setUrlValidationError('URL is required');
      return false;
    }
    
    try {
      new URL(url);
      setUrlValidationError('');
      return true;
    } catch (e) {
      setUrlValidationError('Invalid URL. Include "https://" or "http://"');
      return false;
    }
  }, []);

  // URL change handler
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    updateCard(index, 'fileUrl', url);
    validateUrl(url);
    setUploadMethod('url');
  }, [index, updateCard, validateUrl]);

  // Use test URL
  const handleTestUrlClick = useCallback(() => {
    const testUrls = [
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v4553622368473064581/products/30115.301151.png",
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v2659285799032368481/products/30106.301061.png",
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v3133775529024754871/products/30132.301321.png",
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v5457449167124694502/products/30119.301191.png"
    ];
    
    const newUrl = testUrls[index % testUrls.length];
    updateCard(index, 'fileUrl', newUrl);
    updateCard(index, 'fileType', 'image');
    updateCard(index, 'fileHandle', `test-file-${Date.now()}`);
    setUploadMethod('url');
    validateUrl(newUrl);
  }, [index, updateCard, validateUrl]);

  // Clear URL
  const handleClearUrl = useCallback(() => {
    updateCard(index, 'fileUrl', '');
    updateCard(index, 'fileHandle', '');
    setPreviewUrl('');
  }, [index, updateCard]);

  // Change file type
  const handleFileTypeChange = useCallback((e) => {
    updateCard(index, 'fileType', e.target.value);
  }, [index, updateCard]);

  // Get file type icon
  const getFileTypeIcon = useCallback(() => {
    return card.fileType === 'image' ? 
      <FiImage size={20} className={styles.typeIcon} /> : 
      <FiVideo size={20} className={styles.typeIcon} />;
  }, [card.fileType]);

  // Card CSS class based on index
  const cardClass = `${styles.cardContainer} ${index % 2 === 0 ? styles.evenCard : styles.oddCard}`;

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
        <div className={styles.cardNumber}>Card {index + 1}</div>
        <div className={styles.fileTypeSelect}>
          <select 
            className={styles.select}
            value={card.fileType}
            onChange={handleFileTypeChange}
            aria-label="Media type"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <div className={styles.fileTypeIconWrapper}>
            {getFileTypeIcon()}
          </div>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.uploadMethods}>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'url' ? styles.activeMethod : ''}`}
            onClick={() => setUploadMethod('url')}
          >
            <FiLink size={16} />
            <span>URL</span>
          </button>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'file' ? styles.activeMethod : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            <FiUploadCloud size={16} />
            <span>Upload</span>
          </button>
        </div>
        
        {uploadMethod === 'url' ? (
          <div className={styles.formGroup}>
            <label className={styles.label}>File URL</label>
            <div className={styles.inputGroup}>
              <input 
                type="url" 
                className={`${styles.input} ${urlValidationError ? styles.inputError : ''}`}
                value={card.fileUrl || ''}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
              />
              {card.fileUrl ? (
                <button 
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearUrl}
                  aria-label="Clear URL"
                >
                  <FiX size={18} />
                </button>
              ) : (
                <button 
                  type="button"
                  className={styles.testButton}
                  onClick={handleTestUrlClick}
                >
                  <FiTrendingUp size={14} />
                  <span>Use Test URL</span>
                </button>
              )}
            </div>
            {urlValidationError ? (
              <p className={styles.errorText}>{urlValidationError}</p>
            ) : (
              <p className={styles.helpText}>
                Public URL of the {card.fileType === 'image' ? 'image' : 'video'} to display in the carousel
              </p>
            )}
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>File Upload</label>
            <div 
              className={`${styles.dropArea} ${isDragging ? styles.dragging : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              ref={dropAreaRef}
              onClick={handleFileInputClick}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop area"
            >
              <FiUploadCloud size={32} className={styles.uploadIcon} />
              <p className={styles.dropText}>
                {isUploading ? 'Uploading...' : 'Drag a file or click to choose'}
              </p>
              <p className={styles.dropHint}>
                Formats: JPEG, PNG, GIF, WebP, MP4, WebM
              </p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </div>
        )}
        
        {uploadError && (
          <div className={styles.errorMessage}>
            <FiAlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>Preview</span>
            {card.fileUrl && <FiCheck size={16} className={styles.checkIcon} />}
          </div>
          <div className={styles.previewContent}>
            {card.fileType === 'image' ? (
              <img 
                src={previewUrl} 
                alt={`Preview of Card ${index + 1}`} 
                className={styles.previewImage}
                loading="lazy"
              />
            ) : (
              <video 
                src={previewUrl} 
                className={styles.previewVideo} 
                controls
                preload="metadata"
              />
            )}
          </div>
          {card.fileUrl && (
            <div className={styles.previewActions}>
              <a 
                href={card.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.viewOriginalLink}
              >
                <FiExternalLink size={14} />
                View original
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardUploadInput;