// hooks/useTextContent.js
import { useContext } from 'react';
import { TextContentContext } from '../../contexts/TextContentContext';

/**
 * Hook para acessar o conteúdo de texto centralizado
 * @returns {Object} Textos da aplicação
 */
export const useTextContent = () => {
  const context = useContext(TextContentContext);
  
  if (!context) {
    throw new Error('useTextContent deve ser usado dentro de TextContentProvider');
  }
  
  return context;
};