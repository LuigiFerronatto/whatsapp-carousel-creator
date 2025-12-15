// services/api/apiConfig.js
/**
 * Configuração centralizada da API
 */

// Base URL para todas as requisições à API
export const API_BASE_URL = 'https://msging.net';

/**
 * Cabeçalhos padrão para requisições à API
 * @param {string} authKey - Chave de autorização
 * @returns {Object} Cabeçalhos HTTP
 */
export const getHeaders = (authKey) => ({
  'Content-Type': 'application/json',
  'Authorization': authKey
});