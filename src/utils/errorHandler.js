// utils/errorHandler.js
/**
 * Trata erros de API de forma padronizada
 * @param {Error} error - Erro capturado
 * @returns {string} Mensagem de erro amigável
 */
export const handleApiError = (error) => {
  console.error('Erro original:', error);
  
  // Se for um erro de rede
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Se for um erro com código específico
  if (error.code) {
    // Formatar a mensagem com base no código
    return `[${error.code}] ${error.message}`;
  }
  
  // Para qualquer outro tipo de erro, usar a mensagem original
  return error.message || 'Ocorreu um erro inesperado';
};