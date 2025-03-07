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
 * Componente aprimorado para upload ou seleção de URL para cada cartão do carrossel
 * 
 * @param {Object} props Propriedades do componente
 * @param {number} props.index Índice do cartão
 * @param {Object} props.card Dados do cartão
 * @param {Function} props.updateCard Função para atualizar dados do cartão
 * @param {number} props.totalCards Total de cartões
 * @returns {JSX.Element} Componente CardUploadInput
 */
const CardUploadInput = ({ index, card, updateCard, totalCards }) => {
  // Estado local
  const [uploadMethod, setUploadMethod] = useState('url');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  
  // Refs
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Hook customizado para upload de arquivos
  const { 
    uploadToAzure, 
    isUploading, 
    uploadError, 
    uploadedFile, 
    resetUpload 
  } = useFileUpload();

  // Atualiza preview quando a URL do cartão muda
  useEffect(() => {
    if (card.fileUrl) {
      setPreviewUrl(card.fileUrl);
      setUrlValidationError('');
    } else {
      setPreviewUrl('');
    }
  }, [card.fileUrl]);

  // Manipuladores de arrastar e soltar
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

  // Manipulador de upload de arquivo
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Determina o tipo de arquivo (imagem ou vídeo)
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      updateCard(index, 'fileType', fileType);
      
      // Cria preview local temporário
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      
      // Faz upload para Azure
      const uploadResult = await uploadToAzure(file);

      // Atualiza cartão com URL do blob
      updateCard(index, 'fileUrl', uploadResult.url);
      updateCard(index, 'fileType', uploadResult.type);
      updateCard(index, 'fileHandle', uploadResult.name || `file-${Date.now()}`);
      
      // Limpa o preview temporário
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      // Limpa input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [index, updateCard, uploadToAzure]);

  // Abre seletor de arquivos
  const handleFileInputClick = useCallback(() => {
    resetUpload();
    fileInputRef.current?.click();
  }, [resetUpload]);

  // Validação de URL
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

  // Manipulador de mudança de URL
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value;
    updateCard(index, 'fileUrl', url);
    validateUrl(url);
    setUploadMethod('url');
  }, [index, updateCard, validateUrl]);

  // Usa URL de teste
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

  // Limpa URL
  const handleClearUrl = useCallback(() => {
    updateCard(index, 'fileUrl', '');
    updateCard(index, 'fileHandle', '');
    setPreviewUrl('');
  }, [index, updateCard]);

  // Muda tipo de arquivo
  const handleFileTypeChange = useCallback((e) => {
    updateCard(index, 'fileType', e.target.value);
  }, [index, updateCard]);

  // Obtém ícone do tipo de arquivo
  const getFileTypeIcon = useCallback(() => {
    return card.fileType === 'image' ? 
      <FiImage size={20} className={styles.typeIcon} /> : 
      <FiVideo size={20} className={styles.typeIcon} />;
  }, [card.fileType]);

  // Classe CSS do cartão baseada no índice
  const cardClass = `${styles.cardContainer} ${index % 2 === 0 ? styles.evenCard : styles.oddCard}`;

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
        <div className={styles.cardNumber}>Cartão {index + 1}</div>
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
                  <FiTrendingUp size={14} />
                  <span>URL de Teste</span>
                </button>
              )}
            </div>
            {urlValidationError ? (
              <p className={styles.errorText}>{urlValidationError}</p>
            ) : (
              <p className={styles.helpText}>
                URL pública da {card.fileType === 'image' ? 'imagem' : 'vídeo'} para exibir no carrossel
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
              aria-label="Área de arrastar e soltar"
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
            <span className={styles.previewTitle}>Pré-visualização</span>
            {card.fileUrl && <FiCheck size={16} className={styles.checkIcon} />}
          </div>
          <div className={styles.previewContent}>
            {card.fileType === 'image' ? (
              <img 
                src={previewUrl} 
                alt={`Pré-visualização do Cartão ${index + 1}`} 
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
                Ver original
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardUploadInput;