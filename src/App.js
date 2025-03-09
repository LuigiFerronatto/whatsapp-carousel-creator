// App.js
import React, { useEffect, Suspense, lazy } from 'react';
import { WhatsAppTemplateProvider } from './contexts/WhatsAppTemplateContext';
// import { TextContentProvider } from './contexts/TextContentContext';
// import { ToastProvider } from './components/ui/Feedback/Feedback';
import { AlertProvider } from './components/ui/AlertMessage/AlertContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/ui/Loading/Loading';
import { createAzureBlobService } from './services/storage/azureBlobService';
import './styles/design-system.css';

// Lazy load the main component to improve initial load performance
const WhatsAppCarouselCreator = lazy(() => import('./components/WhatsAppCarouselCreator'));

/**
 * Componente raiz da aplicação
 * Inicializa serviços e provê contextos globais
 */
function App() {
  // Inicializar serviços ao carregar a aplicação
  useEffect(() => {
    // Inicializar o Azure Blob Service (se necessário)
    try {
      const blobService = createAzureBlobService();
      // console.log('Azure Blob Service inicializado com sucesso');
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
      <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
        {/* O AlertProvider DEVE vir antes do WhatsAppTemplateProvider 
            para que o useAlert esteja disponível */}
        <AlertProvider>
          {/* <TextContentProvider> */}
            <WhatsAppTemplateProvider>
              <div className="app-container">
                <main className="app-content">
                  <Suspense fallback={
                    <div className="loading-container">
                      <Loading 
                        size="large" 
                        color="primary" 
                        message="Carregando aplicação..." 
                      />
                    </div>
                  }>
                    <ErrorBoundary 
                      showDetails={process.env.NODE_ENV === 'development'}
                      fallbackAction={() => window.location.reload()}
                      fallbackActionText="Recarregar Página"
                    >
                      <WhatsAppCarouselCreator />
                    </ErrorBoundary>
                  </Suspense>
                </main>
              </div>
            </WhatsAppTemplateProvider>
          {/* </TextContentProvider> */}
        </AlertProvider>
      </ErrorBoundary>
  );
}

export default App;