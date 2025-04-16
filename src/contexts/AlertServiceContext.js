// contexts/AlertServiceContext.js
import React, { createContext, useContext } from 'react';
import { useAlert } from '../components/ui/AlertMessage/AlertContext';
import { createAlertService } from '../services/alert/alertService';

// Criar o contexto para o serviço de alertas
const AlertServiceContext = createContext(null);

/**
 * Provider para o serviço de alertas
 * Disponibiliza um serviço de alertas centralizado para toda a aplicação
 * 
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} - Provider do serviço de alertas
 */
export const AlertServiceProvider = ({ children }) => {
  // Obter o hook de alertas
  const alertHook = useAlert();
  
  // Criar o serviço de alertas
  const alertService = createAlertService(alertHook);
  
  return (
    <AlertServiceContext.Provider value={alertService}>
      {children}
    </AlertServiceContext.Provider>
  );
};

/**
 * Hook para usar o serviço de alertas em componentes
 * @returns {Object} - Serviço de alertas
 * @throws {Error} - Se usado fora do AlertServiceProvider
 */
export const useAlertServiceContext = () => {
  const context = useContext(AlertServiceContext);
  
  if (!context) {
    throw new Error('useAlertServiceContext deve ser usado dentro de um AlertServiceProvider');
  }
  
  return context;
};

/**
 * Hook alternativo que cria o serviço sob demanda se não estiver disponível no contexto
 * Esta versão é mais flexível mas menos eficiente do que usar o contexto
 * @returns {Object} - Serviço de alertas
 */
export const useAlertService = () => {
  const alertHook = useAlert();
  
  try {
    // Tentar obter do contexto primeiro
    return useAlertServiceContext();
  } catch (error) {
    // Se não estiver disponível no contexto, criar localmente
    console.warn('AlertServiceContext não está disponível, criando serviço localmente');
    return createAlertService(alertHook);
  }
};