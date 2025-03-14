// contexts/WhatsAppTemplateContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWhatsAppTemplate } from '../hooks/template/useWhatsAppTemplate';

// Criar o contexto
const WhatsAppTemplateContext = createContext();

/**
 * Hook para acessar o contexto do template WhatsApp
 * @returns {Object} Dados e métodos do contexto
 */
export const useWhatsAppTemplateContext = () => {
  const context = useContext(WhatsAppTemplateContext);
  if (!context) {
    throw new Error('useWhatsAppTemplateContext deve ser usado dentro de WhatsAppTemplateProvider');
  }
  return context;
};

/**
 * Provider para o contexto do template WhatsApp
 * @param {Object} props.children Componentes filhos
 * @returns {JSX.Element} Provider do contexto
 */
export const WhatsAppTemplateProvider = ({ children }) => {
  // Flag para evitar alertas no carregamento inicial
  const initialRenderRef = useRef(true);
  
  // Estado para controlar se devemos mostrar alertas
  const [allowAlerts, setAllowAlerts] = useState(false);
  
  // Usar o hook principal
  const templateState = useWhatsAppTemplate();
  
  // Efeito para habilitar alertas após o carregamento inicial
  useEffect(() => {
    // Aguardar 1 segundo antes de habilitar alertas
    // Isso evita que alertas de carregamento inicial disparem loops
    const timer = setTimeout(() => {
      initialRenderRef.current = false;
      setAllowAlerts(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Envolver o estado do template com verificação de alertas permitidos
  const wrappedState = {
    ...templateState,
    // Adicionar flag para facilitar debugging
    allowAlerts,
    isInitialRender: initialRenderRef.current
  };
  
  return (
    <WhatsAppTemplateContext.Provider value={wrappedState}>
      {children}
    </WhatsAppTemplateContext.Provider>
  );
};