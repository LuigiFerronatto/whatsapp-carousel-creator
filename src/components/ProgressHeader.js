// components/ProgressHeader.js
import React from 'react';

const ProgressHeader = ({ step }) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>
        1. Upload de Arquivos
      </div>
      <div className="w-10 h-1 bg-gray-300"></div>
      <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>
        2. Criação do Template
      </div>
      <div className="w-10 h-1 bg-gray-300"></div>
      <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600 font-bold' : ''}`}>
        3. Finalização
      </div>
    </div>
  );
};

export default ProgressHeader;