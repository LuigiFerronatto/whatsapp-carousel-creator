// /contexts/WhatsAppTemplateContext.js
import React, { createContext, useContext, useMemo } from 'react';
import { useWhatsAppTemplate } from '../hooks/template/useWhatsAppTemplate';

// Create the context with a default empty value
const WhatsAppTemplateContext = createContext(null);

/**
 * Provider component that wraps the application to make WhatsApp template state
 * available to all child components
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const WhatsAppTemplateProvider = ({ children }) => {
  // Get the template state from the hook
  const templateState = useWhatsAppTemplate();
  
  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = useMemo(() => templateState, [
    // Include dependencies that should trigger context updates
    templateState.step,
    templateState.authKey,
    templateState.numCards,
    templateState.templateName,
    templateState.language,
    templateState.bodyText,
    templateState.phoneNumber,
    templateState.loading,
    templateState.error,
    templateState.success,
    // Using JSON.stringify for complex objects - use with caution as it has performance implications
    // but helps prevent excessive rerenders for complex state
    JSON.stringify(templateState.cards),
    JSON.stringify(templateState.finalJson),
    JSON.stringify(templateState.uploadResults)
  ]);
  
  return (
    <WhatsAppTemplateContext.Provider value={memoizedValue}>
      {children}
    </WhatsAppTemplateContext.Provider>
  );
};

/**
 * Custom hook to use the WhatsApp template context
 * @returns {Object} The WhatsApp template context
 * @throws {Error} If used outside of a WhatsAppTemplateProvider
 */
export const useWhatsAppTemplateContext = () => {
  const context = useContext(WhatsAppTemplateContext);
  
  if (context === null) {
    throw new Error('useWhatsAppTemplateContext deve ser usado dentro de WhatsAppTemplateProvider');
  }
  
  return context;
};