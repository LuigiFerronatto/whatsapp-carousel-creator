// components/JsonViewer.js
import React from 'react';

const JsonViewer = ({ json, onCopy }) => {
  if (!json) {
    return (
      <div className="bg-gray-100 p-4 rounded text-gray-500 text-center">
        JSON não disponível
      </div>
    );
  }

  return (
    <div className="relative">
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64 text-xs">
        {JSON.stringify(json, null, 2)}
      </pre>
      <button 
        className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        onClick={onCopy}
      >
        Copiar
      </button>
    </div>
  );
};

export default JsonViewer;