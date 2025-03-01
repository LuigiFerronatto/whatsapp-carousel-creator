// App.js
import React, { useEffect } from 'react';
import { WhatsAppTemplateProvider } from './contexts/WhatsAppTemplateContext';
import WhatsAppCarouselCreator from './components/WhatsAppCarouselCreator';
import { createAzureBlobService } from './services/storage/azureBlobService';
import './index.css';

/**
 * Componente raiz da aplicação
 * Inicializa serviços e provê contexto global
 */
function App() {
  // Inicializar serviços ao carregar a aplicação
  useEffect(() => {
    // Inicializar o Azure Blob Service (se necessário)
    try {
      const blobService = createAzureBlobService();
      console.log('Azure Blob Service inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Azure Blob Service:', error);
    }
    
    // Verificar modo de ambiente
    console.log(`Aplicação rodando em modo: ${process.env.NODE_ENV}`);
    
    // Verificar se temos as variáveis de ambiente necessárias
    if (!process.env.REACT_APP_AZURE_STORAGE_ACCOUNT_NAME || 
        !process.env.REACT_APP_AZURE_SAS_TOKEN) {
      console.warn('Aviso: Algumas variáveis de ambiente não estão configuradas');
    }
  }, []);

  return (
    <WhatsAppTemplateProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>WhatsApp Carousel Creator</h1>
          <div className="app-tagline">
            Crie templates de carrossel de forma simples e rápida
          </div>
        </header>
        
        <main className="app-content">
          <WhatsAppCarouselCreator />
        </main>
        
        <footer className="app-footer">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} - WhatsApp Carousel Creator</p>
            <div className="footer-links">
              <a href="#help" className="footer-link">Ajuda</a>
              <a href="#about" className="footer-link">Sobre</a>
              <a href="#privacy" className="footer-link">Privacidade</a>
            </div>
          </div>
        </footer>
      </div>
    </WhatsAppTemplateProvider>
  );
}

export default App;