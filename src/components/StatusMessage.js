// components/StatusMessage.js
import React from 'react';

const StatusMessage = ({ error, success }) => {
  return (
    <>
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          <div className="font-bold">Erro:</div>
          <div>{error}</div>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
          <div className="font-bold">Status:</div>
          <div>{success}</div>
        </div>
      )}
    </>
  );
};

export default StatusMessage;