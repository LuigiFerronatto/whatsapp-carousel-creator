// components/ButtonEditor.js
import React from 'react';

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
    <div className="p-3 border rounded mb-2 bg-white">
      <div className="flex justify-between mb-2">
        <span className="font-medium">Botão {buttonIndex + 1}</span>
        {totalButtons > 1 && (
          <button 
            onClick={removeButton}
            className="text-red-500 text-sm"
            aria-label="Remover botão"
          >
            Remover
          </button>
        )}
      </div>
      
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Tipo de Botão</label>
        <select 
          className="w-full p-2 border rounded"
          value={button.type}
          onChange={(e) => updateButtonField('type', e.target.value)}
        >
          <option value="URL">Link URL</option>
          <option value="QUICK_REPLY">Resposta Rápida</option>
          <option value="PHONE_NUMBER">Telefone</option>
        </select>
      </div>
      
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Texto do Botão</label>
        <input 
          type="text"
          className="w-full p-2 border rounded"
          value={button.text}
          onChange={(e) => updateButtonField('text', e.target.value)}
          placeholder="Texto (máximo 20 caracteres)"
          maxLength={20}
        />
      </div>
      
      {button.type === 'URL' && (
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">URL</label>
          <input 
            type="text"
            className="w-full p-2 border rounded"
            value={button.url || ''}
            onChange={(e) => updateButtonField('url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      )}
      
      {button.type === 'QUICK_REPLY' && (
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Payload (opcional)</label>
          <input 
            type="text"
            className="w-full p-2 border rounded"
            value={button.payload || ''}
            onChange={(e) => updateButtonField('payload', e.target.value)}
            placeholder="Texto que será enviado quando o botão for clicado"
          />
          <p className="text-xs text-gray-500 mt-1">Se vazio, o texto do botão será usado como payload</p>
        </div>
      )}
      
      {button.type === 'PHONE_NUMBER' && (
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Número de Telefone</label>
          <input 
            type="text"
            className="w-full p-2 border rounded"
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