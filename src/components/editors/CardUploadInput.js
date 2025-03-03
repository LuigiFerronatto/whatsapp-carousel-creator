// components/editors/CardUploadInput.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import Button from '../common/Button';
import { FiImage, FiVideo, FiUploadCloud, FiLink, FiCheck, FiAlertCircle, FiX } from 'react-icons/fi';
import styles from './CardUploadInput.module.css';

/**
 * Componente para upload ou seleção de URL para cada card do carousel
 * Versão aprimorada com melhor experiência do usuário e feedback
 * 
 * @param {Object} props Propriedades do componente
 * @param {number} props.index Índice do card
 * @param {Object} props.card Dados do card
 * @param {Function} props.updateCard Função para atualizar o card
 * @param {number} props.totalCards Número total de cards
 * @returns {JSX.Element} Componente de input para upload de card
 */
const CardUploadInput = ({ index, card, updateCard, totalCards }) => {
  // Estados
  const [uploadMethod, setUploadMethod] = useState('url');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  
  // Refs
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Hook personalizado para upload de arquivos
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
      setUrlValidationError('');
    } else {
      setPreviewUrl('');
    }
  }, [card.fileUrl]);

  // Funções para drag and drop
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

  // Lidar com upload de arquivo
  const handleFileUpload = useCallback(async (event) => {
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
      updateCard(index, 'fileHandle', uploadResult.name || `file-${Date.now()}`);
      
      // Limpar a prévia temporária
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      // Limpar input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [index, updateCard, uploadToAzure]);

  // Abrir o seletor de arquivo
  const handleFileInputClick = useCallback(() => {
    resetUpload();
    fileInputRef.current?.click();
  }, [resetUpload]);

  // Validar URL
  const validateUrl = useCallback((url) => {
    if (!url) {
      setUrlValidationError('URL é obrigatória');
      return false;
    }
    
    try {
      new URL(url);
      setUrlValidationError('');
      return true;
    } catch (e) {
      setUrlValidationError('URL inválida. Inclua "https://" ou "http://"');
      return false;
    }
  }, []);

  // Atualizar URL do card
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    updateCard(index, 'fileUrl', url);
    validateUrl(url);
    setUploadMethod('url');
  }, [index, updateCard, validateUrl]);

  // Usar URL de teste
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

  // Limpar URL
  const handleClearUrl = useCallback(() => {
    updateCard(index, 'fileUrl', '');
    updateCard(index, 'fileHandle', '');
    setPreviewUrl('');
  }, [index, updateCard]);

  // Alternar tipo de arquivo
  const handleFileTypeChange = useCallback((e) => {
    updateCard(index, 'fileType', e.target.value);
  }, [index, updateCard]);

  // Ícone com base no tipo de arquivo
  const getFileTypeIcon = useCallback(() => {
    return card.fileType === 'image' ? <FiImage size={20} /> : <FiVideo size={20} />;
  }, [card.fileType]);

  // Classes CSS para o card
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
            aria-label="Tipo de mídia"
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
                type="url" 
                className={`${styles.input} ${urlValidationError ? styles.inputError : ''}`}
                value={card.fileUrl || ''}
                onChange={handleUrlChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {card.fileUrl ? (
                <button 
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearUrl}
                  aria-label="Limpar URL"
                >
                  <FiX size={18} />
                </button>
              ) : (
                <button 
                  type="button"
                  className={styles.testButton}
                  onClick={handleTestUrlClick}
                >
                  Usar URL de Teste
                </button>
              )}
            </div>
            {urlValidationError ? (
              <p className={styles.errorText}>{urlValidationError}</p>
            ) : (
              <p className={styles.helpText}>
                URL pública da {card.fileType === 'image' ? 'imagem' : 'vídeo'} que será exibida no carousel
              </p>
            )}
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
              role="button"
              tabIndex={0}
              aria-label="Área para arrastar e soltar arquivo"
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
                alt={`Prévia do Card ${index + 1}`} 
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