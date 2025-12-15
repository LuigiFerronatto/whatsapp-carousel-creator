// services/api/apiUploadFiles.js
import { API_BASE_URL, getHeaders } from './apiConfig';
import { validateFileUrls } from '../validation/validationService';

/**
 * Realiza upload dos arquivos para a API
 * @param {Array} cards - Lista de cards com URLs de arquivos
 * @param {string} authKey - Chave de autorização
 * @returns {Promise<Array>} Resultado do upload com fileHandles
 */
export const uploadFiles = async (cards, authKey) => {
  // Validar URLs antes de começar
  validateFileUrls(cards);
  
  const results = [];

  // Processar uploads sequencialmente para evitar sobrecarga
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    
    // Gerar ID único para a requisição
    const requestId = `template_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Preparar o corpo da requisição
    const uploadRequestBody = {
      id: requestId,
      method: "set",
      to: "postmaster@wa.gw.msging.net",
      type: "application/vnd.lime.media-link+json",
      uri: "/message-templates-attachment",
      resource: {
        uri: card.fileUrl
      }
    };
    
    try {
      console.log(`Iniciando upload do arquivo ${i + 1}:`, card.fileUrl);
      
      const response = await fetch(`${API_BASE_URL}/commands`, {
        method: 'POST',
        headers: getHeaders(authKey),
        body: JSON.stringify(uploadRequestBody)
      });
      
      if (!response.ok) {
        console.error(`Erro na resposta HTTP para card ${i+1}: ${response.status} ${response.statusText}`);
        throw new Error(`Falha na requisição: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log(`Resposta do upload do arquivo ${i + 1}:`, responseData);
      
      // Verificar explicitamente o status de falha
      if (responseData.status === 'failure') {
        // Extrair informações detalhadas do erro
        const errorCode = responseData.reason?.code;
        const errorDescription = responseData.reason?.description || 'Erro desconhecido';
        
        // Criar um erro personalizado com detalhes
        const uploadError = new Error(`Falha no upload: ${errorDescription}`);
        uploadError.code = errorCode;
        uploadError.originalResponse = responseData;
        
        // Logar o erro detalhadamente
        console.error(`Erro de upload para o card ${i + 1}:`, {
          code: errorCode,
          description: errorDescription,
          fullResponse: responseData
        });
        
        // Lançar o erro personalizado
        throw uploadError;
      }
      
      // Verificar se o status não é sucesso
      if (responseData.status !== 'success') {
        console.error(`Falha ao fazer upload do arquivo ${i + 1}: ${responseData.reason || 'Erro desconhecido'}`);
        throw new Error(responseData.reason || 'Falha no upload do arquivo');
      }
      
      // Extrair o fileHandle da resposta
      const fileHandle = responseData.resource?.fileHandle;
      
      if (!fileHandle) {
        console.error(`Não foi possível obter o fileHandle para o card ${i + 1}`);
        throw new Error(`Não foi possível obter o fileHandle para o card ${i + 1}`);
      }
      
      // Armazenar o resultado
      results.push({
        fileHandle: fileHandle,
        status: 'success'
      });
      
      console.log(`Upload do arquivo ${i + 1} concluído com sucesso. Handle: ${fileHandle}`);
    } catch (error) {
      console.error(`Erro no upload do card ${i+1}:`, error);
      
      // Adicionar informações detalhadas do erro
      const errorDetails = {
        message: error.message,
        code: error.code,
        cardIndex: i,
        fileUrl: card.fileUrl,
        originalResponse: error.originalResponse
      };
      
      // Se for um erro conhecido da msging.net (código 100 de arquivo expirado)
      if (error.code === 81 && error.message.includes('file handle that has expired')) {
        // Adicionar informação específica de handle expirado
        errorDetails.isExpiredHandle = true;
      }
      
      // Adicionar ao array de resultados como falha
      results.push({
        status: 'failure',
        error: errorDetails
      });
    }
  }

  return results;
};