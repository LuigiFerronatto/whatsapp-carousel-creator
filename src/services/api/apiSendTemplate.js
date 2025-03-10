const API_BASE_URL = 'https://msging.net';

/**
 * Cabeçalhos básicos para requisições à API
 * @param {string} authKey - Chave de autorização
 * @returns {Object} Cabeçalhos HTTP
 */
const getHeaders = (authKey) => ({
  'Content-Type': 'application/json',
  'Authorization': authKey
});

/**
 * Envia o template para um número de telefone
 * @param {string} phoneNumber - Número de telefone formatado
 * @param {Object} sendTemplate - JSON de envio do template
 * @param {string} authKey - Chave de autorização
 * @returns {Promise<Object>} Resultado do envio
 */
export const sendTemplateMessage = async (phoneNumber, sendTemplate, authKey) => {
  // Preparar o JSON de envio
  const sendJson = {
    ...sendTemplate,
    to: `${phoneNumber}@wa.gw.msging.net`
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(authKey),
      body: JSON.stringify(sendJson)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao enviar template: ${errorText}`);
    }
    
    return { 
      success: true, 
      message: `Template enviado com sucesso para ${phoneNumber}` 
    };
  } catch (error) {
    console.error('Erro ao enviar template:', error);
    throw error;
  }
};