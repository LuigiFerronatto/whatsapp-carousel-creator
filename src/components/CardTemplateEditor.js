// components/CardTemplateEditor.js
import React from 'react';
import ButtonEditor from './ButtonEditor';
import styles from './CardTemplateEditor.module.css';

const CardTemplateEditor = ({ index, card, cards, setCards }) => {
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
          onChange={(e) => {
            const newCards = [...cards];
            newCards[index] = { ...newCards[index], bodyText: e.target.value };
            setCards(newCards);
          }}
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
            cards={cards}
            setCards={setCards}
            totalButtons={card.buttons.length}
          />
        ))}
        
        {card.buttons.length < 2 && (
          <button 
            onClick={() => {
              const newCards = [...cards];
              newCards[index].buttons.push({ 
                type: 'QUICK_REPLY',
                text: ''
              });
              setCards(newCards);
            }}
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