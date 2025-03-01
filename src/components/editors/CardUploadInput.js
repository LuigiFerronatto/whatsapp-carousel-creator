// editors/CardUploadInput.js

import React, { useState, useRef } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import styles from './CardUploadInput.module.css';

const CardUploadInput = ({ index, card, updateCard }) => {
  const [uploadMethod, setUploadMethod] = useState('url');
  const fileInputRef = useRef(null);
  const { 
    uploadToAzure, 
    isUploading, 
    uploadError, 
    uploadedFile, 
    resetUpload 
  } = useFileUpload();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Fazer upload para o Azure
      const uploadResult = await uploadToAzure(file);

      // Atualizar o card com a URL do blob
      updateCard(index, 'fileUrl', uploadResult.url);
      updateCard(index, 'fileType', uploadResult.type);
    } catch (error) {
      // Erro já tratado no hook
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

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardTitle}>Card {index + 1}</div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>URL do Arquivo</label>
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            className={styles.input}
            value={card.fileUrl}
            onChange={(e) => {
              updateCard(index, 'fileUrl', e.target.value);
              // Resetar método de upload para URL
              setUploadMethod('url');
            }}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          <button 
            type="button"
            className={styles.testButton}
            onClick={() => {
              const testUrls = [
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v4553622368473064581/products/30115.301151.png",
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v2659285799032368481/products/30106.301061.png",
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v3133775529024754871/products/30132.301321.png",
                "https://www.yamaha-motor.com.br/ccstore/v1/images/?source=/file/v5457449167124694502/products/30119.301191.png"
              ];
              updateCard(index, 'fileUrl', testUrls[index % testUrls.length]);
              updateCard(index, 'fileType', 'image');
              setUploadMethod('url');
            }}
          >
            Testar URL
          </button>
        </div>
        <p className={styles.helpText}>URL pública da imagem/vídeo que será exibida no carrossel</p>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Upload de Arquivo</label>
        <button 
          type="button" 
          className={styles.input}
          onClick={handleFileInputClick}
        >
          {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        <p className={styles.helpText}>Formatos suportados: JPEG, PNG, GIF, WebP (imagens), MP4, WebM (vídeos) - Máximo 50MB</p>
      </div>
      
      {uploadError && (
        <div className={styles.formGroup} style={{ color: 'red' }}>
          {uploadError}
        </div>
      )}

      {card.fileUrl && (
        <div className={styles.formGroup}>
          <label className={styles.label}>URL do Arquivo Carregado</label>
          <input 
            type="text" 
            className={styles.input} 
            value={card.fileUrl} 
            readOnly 
          />
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo do Arquivo</label>
        <select 
          className={styles.select}
          value={card.fileType}
          onChange={(e) => updateCard(index, 'fileType', e.target.value)}
        >
          <option value="image">Imagem</option>
          <option value="video">Vídeo</option>
        </select>
      </div>
    </div>
  );
};

export default CardUploadInput;