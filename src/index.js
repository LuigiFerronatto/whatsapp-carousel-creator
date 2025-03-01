import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Importar o App em vez de WhatsAppCarouselCreator

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);