// utils/errorHandler.js
export const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Erro de resposta do servidor
      return `Erro ${error.response.status}: ${error.response.data.message || 'Erro desconhecido'}`;
    } else if (error.request) {
      // Erro de conexão
      return 'Erro de conexão com o servidor. Verifique sua internet.';
    } else {
      // Outros erros
      return error.message || 'Ocorreu um erro desconhecido';
    }
  };