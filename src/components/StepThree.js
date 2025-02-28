// components/StepThree.js
import React from 'react';
import StatusMessage from './StatusMessage';
import JsonViewer from './JsonViewer';

const StepThree = ({
  finalJson,
  copyToClipboard,
  phoneNumber,
  setPhoneNumber,
  sendTemplate,
  resetForm,
  error,
  success,
  loading
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Passo 3: Template Criado</h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">1. JSON para criar o template:</h3>
        <JsonViewer 
          json={finalJson.createTemplate} 
          onCopy={() => copyToClipboard('createTemplate')} 
        />
      </div>
      
      <div className="mt-6 mb-4">
        <h3 className="font-medium mb-2">2. JSON para enviar o template:</h3>
        <JsonViewer 
          json={finalJson.sendTemplate} 
          onCopy={() => copyToClipboard('sendTemplate')} 
        />
      </div>
      
      <div className="mt-6 p-4 border rounded bg-blue-50">
        <h3 className="font-medium mb-3">Enviar Template para WhatsApp</h3>
        <p className="text-sm mb-3">Envie o template diretamente para um número de WhatsApp:</p>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Número de Telefone (com DDI)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="5521999999999"
          />
          <p className="text-xs text-gray-500 mt-1">Digite o número completo com DDI (ex: 5521999999999)</p>
        </div>
        
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full flex items-center justify-center"
          onClick={sendTemplate}
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? 'Enviando...' : 'Enviar Template'}
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="font-bold mb-2">Próximos Passos:</h3>
        <ol className="list-decimal ml-5 space-y-2">
          <li>O template criado precisa ser aprovado pela Meta antes de poder ser enviado</li>
          <li>O processo de aprovação geralmente leva algumas horas ou dias</li>
          <li>Após aprovado, você pode enviar o template para qualquer contato que interagiu com seu número</li>
        </ol>
      </div>
      
      <div className="mt-6">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
          onClick={resetForm}
        >
          Criar Novo Template
        </button>
      </div>
      
      <StatusMessage error={error} success={success} />
    </div>
  );
};

export default StepThree;