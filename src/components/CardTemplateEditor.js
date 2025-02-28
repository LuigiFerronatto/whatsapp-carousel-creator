// components/CardTemplateEditor.js
import React from 'react';
import ButtonEditor from './ButtonEditor';

const CardTemplateEditor = ({ index, card, cards, setCards }) => {
  return (
    <div className="mb-6 p-4 border rounded bg-gray-50">
      <h3 className="font-bold mb-2">Card {index + 1}</h3>
      {card.fileHandle && (
        <div className="text-xs text-gray-500 mb-2">File Handle: {card.fileHandle}</div>
      )}
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Texto do Card</label>
        <textarea 
          className="w-full p-2 border rounded"
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
        <div className="text-xs text-gray-500 mt-1">{card.bodyText.length}/160 caracteres</div>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Botões (máximo 2)</label>
        
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
            className="w-full p-2 border border-dashed rounded text-blue-500 hover:bg-blue-50"
          >
            + Adicionar Botão
          </button>
        )}
      </div>
    </div>
  );
};

export default CardTemplateEditor;