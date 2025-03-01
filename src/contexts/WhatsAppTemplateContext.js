// contexts/WhatsAppTemplateContext.js
import React, { createContext, useContext } from 'react';
import { useWhatsAppTemplate } from '../hooks/useWhatsAppTemplate';

const WhatsAppTemplateContext = createContext();

export const WhatsAppTemplateProvider = ({ children }) => {
  const templateState = useWhatsAppTemplate();
  
  return (
    <WhatsAppTemplateContext.Provider value={templateState}>
      {children}
    </WhatsAppTemplateContext.Provider>
  );
};

export const useWhatsAppTemplateContext = () => {
  const context = useContext(WhatsAppTemplateContext);
  if (!context) {
    throw new Error('useWhatsAppTemplateContext deve ser usado dentro de WhatsAppTemplateProvider');
  }
  return context;
};