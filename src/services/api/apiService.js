
// services/api/apiService.js
import { validateFileUrls } from '../validation/validationService';

/**
 * Configuração da base URL da API
 */
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
        
        // Em ambiente de produção, seria melhor lançar um erro
        // Em ambiente de desenvolvimento, podemos simular um sucesso para testes
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Falha na requisição: ${response.status} ${response.statusText}`);
        } else {
          console.warn('Ambiente de desenvolvimento: Usando fileHandle simulado');
          const simulatedHandle = `file-handle-${i + 1}-${Date.now()}`;
          results.push({
            fileHandle: simulatedHandle,
            status: 'simulated'
          });
          continue;
        }
      }
      
      const responseData = await response.json();
      console.log(`Resposta do upload do arquivo ${i + 1}:`, responseData);
      
      if (responseData.status !== 'success') {
        console.error(`Falha ao fazer upload do arquivo ${i + 1}: ${responseData.reason || 'Erro desconhecido'}`);
        
        // Similar ao anterior, em produção seria melhor lançar um erro
        if (process.env.NODE_ENV === 'production') {
          throw new Error(responseData.reason || 'Falha no upload do arquivo');
        } else {
          console.warn('Ambiente de desenvolvimento: Usando fileHandle simulado');
          const simulatedHandle = `file-handle-${i + 1}-${Date.now()}`;
          results.push({
            fileHandle: simulatedHandle,
            status: 'simulated'
          });
          continue;
        }
      }
      
      // Extrair o fileHandle da resposta
      const fileHandle = responseData.resource?.fileHandle;
      
      if (!fileHandle) {
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
      
      // Em ambiente de produção, propagamos o erro
      // Em ambiente de desenvolvimento, podemos simular um sucesso para testes
      if (process.env.NODE_ENV === 'production') {
        throw error;
      } else {
        console.warn('Ambiente de desenvolvimento: Usando fileHandle simulado após erro');
        const simulatedHandle = `file-handle-${i + 1}-${Date.now()}`;
        results.push({
          fileHandle: simulatedHandle,
          status: 'simulated'
        });
      }
    }
  }

  return results;
};

/**
 * Cria o template na API
 * @param {string} templateName - Nome do template
 * @param {string} language - Código de idioma
 * @param {string} bodyText - Texto do corpo da mensagem
 * @param {Array} cards - Lista de cards do carrossel
 * @param {string} authKey - Chave de autorização
 * @returns {Promise<Object>} JSONs do template criado
 */
export const createTemplate = async (templateName, language, bodyText, cards, authKey) => {
  // Geração de ID único para o template
  const templateId = `template_${templateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
  
  // Criação do JSON do template
  const templateJson = {
    id: templateId,
    method: "set",
    type: "application/json",
    to: "postmaster@wa.gw.msging.net",
    uri: "/message-templates",
    resource: {
      name: templateName,
      language: language,
      category: "MARKETING",
      components: [
        { type: "BODY", text: bodyText },
        {
          type: "CAROUSEL",
          cards: cards.map((card) => ({
            components: [
              {
                type: "HEADER",
                format: card.fileType.toUpperCase(),
                example: {
                  header_handle: [card.fileHandle]
                }
              },
              {
                type: "BODY",
                text: card.bodyText
              },
              {
                type: "BUTTONS",
                buttons: card.buttons.map(button => {
                  if (button.type === 'URL') {
                    return {
                      type: button.type,
                      text: button.text,
                      url: button.url
                    };
                  } else if (button.type === 'PHONE_NUMBER') {
                    return {
                      type: button.type,
                      text: button.text,
                      phone_number: button.phoneNumber
                    };
                  } else {
                    return {
                      type: button.type,
                      text: button.text
                    };
                  }
                })
              }
            ]
          }))
        }
      ]
    }
  };
  
  // Em ambiente de produção, envia para a API
  // Em ambiente de desenvolvimento, simula sucesso
  if (process.env.NODE_ENV === 'production') {
    try {
      const response = await fetch(`${API_BASE_URL}/commands`, {
        method: 'POST',
        headers: getHeaders(authKey),
        body: JSON.stringify(templateJson)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na resposta HTTP: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.status !== 'success') {
        throw new Error(`Falha ao criar o template: ${responseData.reason || 'Erro desconhecido'}`);
      }
      
      // Adicionar o ID recebido ao JSON
      if (responseData.resource && responseData.resource.id) {
        templateJson.resource.id = responseData.resource.id;
      }
    } catch (error) {
      console.error('Erro ao criar template na API:', error);
      throw error;
    }
  } else {
    console.warn('Ambiente de desenvolvimento: Simulando criação de template');
  }
  
  // Gerar JSON para envio do template
  const sendTemplateJson = {
    id: `send_${templateName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
    to: "numero@wa.gw.msging.net", 
    type: "application/json",
    content: {
      type: "template",
      template: {
        name: templateName,
        language: {
          code: language,
          policy: "deterministic"
        },
        components: [
          {
            type: "CAROUSEL",
            cards: cards.map((card, index) => ({
              card_index: index,
              components: [
                {
                  type: "HEADER",
                  parameters: [
                    {
                      type: card.fileType.toUpperCase(),
                      [card.fileType.toLowerCase()]: {
                        link: card.fileUrl
                      }
                    }
                  ]
                },
                ...card.buttons.map((button, btnIndex) => {
                  if (button.type === 'URL') {
                    return {
                      type: "BUTTON",
                      sub_type: button.type,
                      index: btnIndex
                    };
                  } else if (button.type === 'QUICK_REPLY') {
                    return {
                      type: "BUTTON",
                      sub_type: button.type,
                      index: btnIndex,
                      parameters: [
                        {
                          type: "PAYLOAD",
                          payload: button.payload || button.text
                        }
                      ]
                    };
                  } else {
                    return {
                      type: "BUTTON",
                      sub_type: button.type,
                      index: btnIndex
                    };
                  }
                })
              ]
            }))
          }
        ]
      }
    }
  };

  // Gerar JSON para uso no Builder da Blip como conteúdo dinâmico
const builderTemplateJson = {
  type: "template",
  template: {
    name: templateName,
    language: {
      code: language,
      policy: "deterministic"
    },
    components: [
      {
        type: "CAROUSEL",
        cards: cards.map((card, index) => ({
          card_index: index,
          components: [
            {
              type: "HEADER",
              parameters: [
                {
                  type: card.fileType.toUpperCase(),
                  [card.fileType.toLowerCase()]: {
                    link: card.fileUrl
                  }
                }
              ]
            },
            ...card.buttons.map((button, btnIndex) => {
              if (button.type === 'URL') {
                return {
                  type: "BUTTON",
                  sub_type: button.type,
                  index: btnIndex
                };
              } else if (button.type === 'QUICK_REPLY') {
                return {
                  type: "BUTTON",
                  sub_type: button.type,
                  index: btnIndex,
                  parameters: [
                    {
                      type: "PAYLOAD",
                      payload: button.payload || button.text
                    }
                  ]
                };
              } else {
                return {
                  type: "BUTTON",
                  sub_type: button.type,
                  index: btnIndex
                };
              }
            })
          ]
        }))
      }
    ]
  }
};

  return { templateJson, sendTemplateJson, builderTemplateJson };
};

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
  
  // Em ambiente de produção, envia para a API
  // Em ambiente de desenvolvimento, simula sucesso
  if (process.env.NODE_ENV === 'production') {
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
      
      return { success: true, message: `Template enviado com sucesso para ${phoneNumber}` };
    } catch (error) {
      console.error('Erro ao enviar template:', error);
      throw error;
    }
  } else {
    console.warn(`Ambiente de desenvolvimento: Simulando envio de template para ${phoneNumber}`);
    return { success: true, message: `[SIMULADO] Template enviado com sucesso para ${phoneNumber}` };
  }
};