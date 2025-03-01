// components/editors/CardTemplateEditor.js
import React from 'react';
import ButtonEditor from './ButtonEditor';
import styles from './CardTemplateEditor.module.css';

const CardTemplateEditor = ({ index, card, cards, updateCard }) => {
  // Usando updateCard em vez de manipular diretamente setCards
  const handleBodyTextChange = (e) => {
    updateCard(index, 'bodyText', e.target.value);
  };

  // Função para atualizar os botões
  const updateButtons = (newButtons) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], buttons: newButtons };
    updateCard(index, 'buttons', newButtons);
  };

  // Adicionar um novo botão
  const addButton = () => {
    if (card.buttons.length < 2) {
      const newButtons = [...card.buttons, { type: 'QUICK_REPLY', text: '' }];
      updateButtons(newButtons);
    }
  };

  // Remover um botão
  const removeButton = (buttonIndex) => {
    const newButtons = card.buttons.filter((_, i) => i !== buttonIndex);
    updateButtons(newButtons);
  };

  // Atualizar um campo específico de um botão
  const updateButtonField = (buttonIndex, field, value) => {
    const newButtons = [...card.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
    updateButtons(newButtons);
  };

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.cardTitle}>Card {index + 1}</h3>
      {card.fileHandle && (
        <div className={styles.fileHandleInfo}>File Handle: {card.fileHandle}</div>
      )}
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Texto do Card</label>
        <textarea 
          className={styles.textarea}
          rows="2"
          value={card.bodyText}
          onChange={handleBodyTextChange}
          placeholder="Texto que aparecerá no card (máximo 160 caracteres)"
          maxLength={160}
        ></textarea>
        <div className={styles.characterCount}>{card.bodyText.length}/160 caracteres</div>
      </div>
      
      <div className={styles.buttonsSection}>
        <label className={styles.label}>Botões (máximo 2)</label>
        
        {card.buttons.map((button, buttonIndex) => (
          <ButtonEditor 
            key={buttonIndex}
            index={index}
            buttonIndex={buttonIndex}
            button={button}
            updateButtonField={updateButtonField}
            removeButton={() => removeButton(buttonIndex)}
            totalButtons={card.buttons.length}
          />
        ))}
        
        {card.buttons.length < 2 && (
          <button 
            onClick={addButton}
            className={styles.addButton}
          >
            + Adicionar Botão
          </button>
        )}
      </div>
    </div>
  );
};

export default CardTemplateEditor;