// components/ButtonEditor.js
import React from 'react';
import styles from './ButtonEditor.module.css';

const ButtonEditor = ({ index, buttonIndex, button, cards, setCards, totalButtons }) => {
  const updateButtonField = (field, value) => {
    const newCards = [...cards];
    newCards[index].buttons[buttonIndex] = {
      ...newCards[index].buttons[buttonIndex],
      [field]: value
    };
    setCards(newCards);
  };

  const removeButton = () => {
    const newCards = [...cards];
    newCards[index].buttons = newCards[index].buttons.filter((_, i) => i !== buttonIndex);
    setCards(newCards);
  };

  return (
    <div className={styles.buttonContainer}>
      <div className={styles.buttonHeader}>
        <span className={styles.buttonTitle}>Botão {buttonIndex + 1}</span>
        {totalButtons > 1 && (
          <button 
            onClick={removeButton}
            className={styles.removeButton}
            aria-label="Remover botão"
          >
            Remover
          </button>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo de Botão</label>
        <select 
          className={styles.select}
          value={button.type}
          onChange={(e) => updateButtonField('type', e.target.value)}
        >
          <option value="URL">Link URL</option>
          <option value="QUICK_REPLY">Resposta Rápida</option>
          <option value="PHONE_NUMBER">Telefone</option>
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Texto do Botão</label>
        <input 
          type="text"
          className={styles.input}
          value={button.text}
          onChange={(e) => updateButtonField('text', e.target.value)}
          placeholder="Texto (máximo 20 caracteres)"
          maxLength={20}
        />
      </div>
      
      {button.type === 'URL' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>URL</label>
          <input 
            type="text"
            className={styles.input}
            value={button.url || ''}
            onChange={(e) => updateButtonField('url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      )}
      
      {button.type === 'QUICK_REPLY' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Payload (opcional)</label>
          <input 
            type="text"
            className={styles.input}
            value={button.payload || ''}
            onChange={(e) => updateButtonField('payload', e.target.value)}
            placeholder="Texto que será enviado quando o botão for clicado"
          />
          <p className={styles.helpText}>Se vazio, o texto do botão será usado como payload</p>
        </div>
      )}
      
      {button.type === 'PHONE_NUMBER' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Número de Telefone</label>
          <input 
            type="text"
            className={styles.input}
            value={button.phoneNumber || ''}
            onChange={(e) => updateButtonField('phoneNumber', e.target.value)}
            placeholder="+5521999999999"
          />
        </div>
      )}
    </div>
  );
};

export default ButtonEditor;