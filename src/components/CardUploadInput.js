// components/CardUploadInput.js
import React from 'react';
import styles from './CardUploadInput.module.css';

const CardUploadInput = ({ index, card, updateCard }) => {
  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.cardTitle}>Card {index + 1}</h3>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>URL do Arquivo</label>
        <div className={styles.inputGroup}>
          <input 
            type="text" 
            className={styles.input}
            value={card.fileUrl}
            onChange={(e) => updateCard(index, 'fileUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
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
            }}
          >
            Testar URL
          </button>
        </div>
        <p className={styles.helpText}>URL pública da imagem/vídeo que será exibida no carrossel</p>
      </div>
      
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