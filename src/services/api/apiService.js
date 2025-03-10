// services/api/apiService.js
import { uploadFiles } from './apiUploadFiles';
import { createTemplate } from './apiCreateTemplate';
import { sendTemplateMessage } from './apiSendTemplate';
import TemplateCreationValidation from '../validation/validationCreateTemplate';

// Configuração da base URL da API (mantida por compatibilidade)
export const API_BASE_URL = 'https://msging.net';

// Função auxiliar de cabeçalhos (mantida por compatibilidade)
export const getHeaders = (authKey) => ({
  'Content-Type': 'application/json',
  'Authorization': authKey
});

// Função para lidar com erros de forma padronizada
const handleApiError = (error, alert) => {
  // Se for um erro de criação de template com código específico
  if (TemplateCreationValidation.isFileHandleExpiredError(error)) {
    alert.error('Os arquivos do template expiraram. Faça o upload novamente.', {
      position: 'top-center',
      autoCloseTime: 7000
    });
  } else if (TemplateCreationValidation.isTemplateAlreadyExistsError(error)) {
    alert.error('Já existe um template com este nome em português. Escolha outro nome.', {
      position: 'top-center',
      autoCloseTime: 7000
    });
  } else {
    // Erro genérico
    alert.error(error.message || 'Erro desconhecido ao processar sua solicitação', {
      position: 'top-center',
      autoCloseTime: 7000
    });
  }
};

// Wrapper para createTemplate com tratamento de erros
export const createTemplateWithErrorHandling = async (
  templateName, 
  language, 
  bodyText, 
  cards, 
  authKey,
  alert
) => {
  try {
    const result = await createTemplate(
      templateName, 
      language, 
      bodyText, 
      cards, 
      authKey
    );
    
    // Mostrar alerta de sucesso
    alert.success('Template criado com sucesso!', {
      position: 'top-right',
      autoCloseTime: 3000
    });

    return result;
  } catch (error) {
    // Tratar o erro com alertas específicos
    handleApiError(error, alert);
    
    // Relançar o erro para ser tratado pelo chamador se necessário
    throw error;
  }
};

// Wrapper para uploadFiles com tratamento de erros
export const uploadFilesWithErrorHandling = async (
  cards, 
  authKey,
  alert
) => {
  try {
    const results = await uploadFiles(cards, authKey);
    
    // Verificar se algum upload falhou
    const failedUploads = results.filter(result => result.status === 'failure');
    
    if (failedUploads.length > 0) {
      // Tratar uploads que falharam
      failedUploads.forEach(failedUpload => {
        const { error } = failedUpload;
        
        if (error.isExpiredHandle) {
          alert.error(`Handle expirado para o card ${error.cardIndex + 1}: ${error.message}`, {
            position: 'top-center'
          });
        } else {
          alert.error(`Falha no upload do card ${error.cardIndex + 1}: ${error.message}`, {
            position: 'top-center'
          });
        }
      });
      
      // Lançar erro para ser tratado pelo chamador
      throw new Error('Falha em um ou mais uploads');
    }

    // Alertar sucesso se todos os uploads funcionarem
    const successMessage = results.length > 1 
      ? `${results.length} arquivos enviados com sucesso` 
      : 'Arquivo enviado com sucesso';
    
    alert.success(successMessage, {
      position: 'top-right',
      autoCloseTime: 3000
    });

    return results;
  } catch (error) {
    // Se já for um erro de alerta, não precisa tratar novamente
    if (error.message === 'Falha em um ou mais uploads') {
      throw error;
    }

    // Tratar qualquer outro erro inesperado
    alert.error(error.message || 'Erro desconhecido durante o upload', {
      position: 'top-center',
      autoCloseTime: 7000
    });

    throw error;
  }
};

// Wrapper para sendTemplateMessage com tratamento de erros
export const sendTemplateMessageWithErrorHandling = async (
  phoneNumber, 
  sendTemplate, 
  authKey,
  alert
) => {
  try {
    const result = await sendTemplateMessage(phoneNumber, sendTemplate, authKey);
    
    alert.success(`Template enviado com sucesso para ${phoneNumber}!`, {
      position: 'top-right',
      autoCloseTime: 3000
    });

    return result;
  } catch (error) {
    alert.error(`Erro ao enviar template: ${error.message}`, {
      position: 'top-center',
      autoCloseTime: 7000
    });

    throw error;
  }
};

// Exportar todas as funções
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
  sendTemplateMessage,
  createTemplateWithErrorHandling,
  uploadFilesWithErrorHandling,
  sendTemplateMessageWithErrorHandling
};