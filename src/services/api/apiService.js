// services/api/apiService.js
// Arquivo principal para exportação das funções da API
import { API_BASE_URL, getHeaders } from './apiConfig';
import { uploadFiles } from './apiUploadFiles';
import { createTemplate } from './apiCreateTemplate';
import { sendTemplateMessage } from './apiSendTemplate';

// Re-exportar a configuração
export { API_BASE_URL, getHeaders };

// Re-exportar as funções da API
export {
  uploadFiles,
  createTemplate,
  sendTemplateMessage
};

// Exportação padrão para manter a compatibilidade com importações existentes
export default {
  API_BASE_URL,
  getHeaders,
  uploadFiles,
  createTemplate,
  sendTemplateMessage
};