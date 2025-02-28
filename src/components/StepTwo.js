// components/StepTwo.js
import React from 'react';
import CardTemplateEditor from './CardTemplateEditor';
import StatusMessage from './StatusMessage';

const StepTwo = ({
  templateName,
  setTemplateName,
  language,
  setLanguage,
  bodyText,
  setBodyText,
  cards,
  numCards,
  setCards,
  handleCreateTemplate,
  setStep,
  error,
  loading
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Passo 2: Criação do Template</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Nome do Template</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="meu_template_carousel"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Idioma</label>
        <select 
          className="w-full p-2 border rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="pt_BR">Português (Brasil)</option>
          <option value="en_US">Inglês (EUA)</option>
          <option value="es_ES">Espanhol (Espanha)</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Texto do Corpo da Mensagem</label>
        <textarea 
          className="w-full p-2 border rounded"
          rows="3"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Texto que aparecerá no topo do carrossel (máximo 1024 caracteres)"
          maxLength={1024}
        ></textarea>
        <div className="text-xs text-gray-500 mt-1">{bodyText.length}/1024 caracteres</div>
      </div>
      
      {cards.slice(0, numCards).map((card, index) => (
        <CardTemplateEditor 
          key={index} 
          index={index} 
          card={card} 
          cards={cards}
          setCards={setCards}
        />
      ))}
      
      <div className="mt-6 flex space-x-4">
        <button 
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-1/2"
          onClick={() => setStep(1)}
        >
          Voltar
        </button>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-1/2 flex items-center justify-center"
          onClick={handleCreateTemplate}
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Processando...' : 'Criar Template'}
        </button>
      </div>
      
      <StatusMessage error={error} success={null} />
    </div>
  );
};

export default StepTwo;