// components/StepOne.js
import React from 'react';
import CardUploadInput from './CardUploadInput';
import StatusMessage from './StatusMessage';

const StepOne = ({ 
  authKey, 
  setAuthKey, 
  numCards, 
  cards, 
  updateCard, 
  handleAddCard, 
  handleRemoveCard, 
  handleUploadFiles, 
  loading, 
  error, 
  success, 
  uploadResults 
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Passo 1: Autenticação e Upload de Arquivos</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Chave de Autorização (Router Key)</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          value={authKey}
          onChange={(e) => setAuthKey(e.target.value)}
          placeholder="Key=xxxxxxxxx"
        />
        <p className="text-xs text-gray-500 mt-1">Necessário para o envio dos arquivos e criação do template</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Número de Cards ({numCards})</label>
          <div>
            <button 
              onClick={handleRemoveCard}
              disabled={numCards <= 2}
              className="px-2 py-1 bg-red-500 text-white rounded mr-2 disabled:opacity-50"
              aria-label="Remover card"
            >
              -
            </button>
            <button 
              onClick={handleAddCard}
              disabled={numCards >= 10}
              className="px-2 py-1 bg-green-500 text-white rounded disabled:opacity-50"
              aria-label="Adicionar card"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {cards.slice(0, numCards).map((card, index) => (
        <CardUploadInput 
          key={index} 
          index={index} 
          card={card} 
          updateCard={updateCard} 
        />
      ))}
      
      <div className="mt-6">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full flex items-center justify-center"
          onClick={handleUploadFiles}
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Processando uploads...' : 'Enviar Arquivos e Continuar'}
        </button>
      </div>
      
      <StatusMessage error={error} success={success} />
      
      {uploadResults.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="font-bold mb-2">Resumo dos uploads:</div>
          <ul className="list-disc ml-5 space-y-1">
            {uploadResults.map((result, idx) => (
              <li key={idx} className="text-sm">
                Card {idx + 1}: 
                <span className={result.status === 'success' ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                  {result.status === 'success' ? ' Enviado com sucesso' : ' Simulado para testes'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StepOne;