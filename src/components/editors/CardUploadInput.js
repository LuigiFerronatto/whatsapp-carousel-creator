// components/editors/CardUploadInput.js
import React, { useState, useRef, useEffect } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { FiImage, FiVideo, FiUploadCloud, FiLink, FiCheck, FiAlertCircle } from 'react-icons/fi';
import styles from './CardUploadInput.module.css';

const CardUploadInput = ({ index, card, updateCard, totalCards }) => {
  const [uploadMethod, setUploadMethod] = useState('url');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  const { 
    uploadToAzure, 
    isUploading, 
    uploadError, 
    uploadedFile, 
    resetUpload 
  } = useFileUpload();

  // Atualizar preview quando a URL do card mudar
  useEffect(() => {
    if (card.fileUrl) {
      setPreviewUrl(card.fileUrl);
    } else {
      setPreviewUrl('');
    }
  }, [card.fileUrl]);

  // Funções para drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Determinar o tipo de arquivo (imagem ou vídeo)
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      updateCard(index, 'fileType', fileType);
      
      // Criar uma prévia local temporária
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      
      // Fazer upload para o Azure
      const uploadResult = await uploadToAzure(file);

      // Atualizar o card com a URL do blob
      updateCard(index, 'fileUrl', uploadResult.url);
      updateCard(index, 'fileType', uploadResult.type);
      
      // Limpar a prévia temporária
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      // Erro já tratado no hook
      console.error('Erro no upload:', error);
    } finally {
      // Limpar input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputClick = () => {
    // Limpar qualquer erro anterior
    resetUpload();
    // Abrir seletor de arquivo
    fileInputRef.current?.click();
  };

  const handleUrlChange = (e) => {
    updateCard(index, 'fileUrl', e.target.value);
    setUploadMethod('url');
  };

  const handleTestUrlClick = () => {
    const testUrls = [
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v4553622368473064581/products/30115.301151.png",
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v2659285799032368481/products/30106.301061.png",
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v3133775529024754871/products/30132.301321.png",
      "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v5457449167124694502/products/30119.301191.png"
    ];
    
    const newUrl = testUrls[index % testUrls.length];
    updateCard(index, 'fileUrl', newUrl);
    updateCard(index, 'fileType', 'image');
    setUploadMethod('url');
  };

  const getFileTypeIcon = () => {
    return card.fileType === 'image' ? <FiImage size={20} /> : <FiVideo size={20} />;
  };

  const cardClass = `${styles.cardContainer} ${index % 2 === 0 ? styles.evenCard : styles.oddCard}`;

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
        <div className={styles.cardNumber}>Card {index + 1}</div>
        <div className={styles.fileTypeSelect}>
          <select 
            className={styles.select}
            value={card.fileType}
            onChange={(e) => updateCard(index, 'fileType', e.target.value)}
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
          <div className={styles.fileTypeIcon}>
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
            <label className={styles.label}>URL do Arquivo</label>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                className={styles.input}
                value={card.fileUrl}
                onChange={handleUrlChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <button 
                type="button"
                className={styles.testButton}
                onClick={handleTestUrlClick}
              >
                Testar URL
              </button>
            </div>
            <p className={styles.helpText}>URL pública da {card.fileType === 'image' ? 'imagem' : 'vídeo'} que será exibida no carrossel</p>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>Upload de Arquivo</label>
            <div 
              className={`${styles.dropArea} ${isDragging ? styles.dragging : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              ref={dropAreaRef}
              onClick={handleFileInputClick}
            >
              <FiUploadCloud size={32} className={styles.uploadIcon} />
              <p className={styles.dropText}>
                {isUploading ? 'Enviando...' : 'Arraste um arquivo ou clique para escolher'}
              </p>
              <p className={styles.dropHint}>
                Formatos: JPEG, PNG, GIF, WebP, MP4, WebM
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
            <span className={styles.previewTitle}>Prévia</span>
            {card.fileUrl && <FiCheck size={16} className={styles.checkIcon} />}
          </div>
          <div className={styles.previewContent}>
            {card.fileType === 'image' ? (
              <img 
                src={previewUrl} 
                alt={`Preview Card ${index + 1}`} 
                className={styles.previewImage}
              />
            ) : (
              <video 
                src={previewUrl} 
                className={styles.previewVideo} 
                controls
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardUploadInput;