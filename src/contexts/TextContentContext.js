// contexts/TextContentContext.js
import React, { createContext } from 'react';
import textContent from '../config/textContent.json';

export const TextContentContext = createContext(null);

/**
 * Provider para conteúdo de texto centralizado
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 * @returns {JSX.Element} Provider component
 */
export const TextContentProvider = ({ children, locale = 'pt-BR' }) => {
  // Aqui poderíamos implementar lógica para diferentes idiomas
  // usando o parâmetro locale
  
  return (
    <TextContentContext.Provider value={textContent}>
      {children}
    </TextContentContext.Provider>
  );
};