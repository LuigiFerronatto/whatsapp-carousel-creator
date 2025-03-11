// services/api/apiCreateTemplate.js
import { API_BASE_URL, getHeaders } from './apiConfig';
import TemplateCreationValidation from '../validation/validationCreateTemplate';

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
  
  try {
    const response = await fetch(`${API_BASE_URL}/commands`, {
      method: 'POST',
      headers: getHeaders(authKey),
      body: JSON.stringify(templateJson)
    });
    
    // Parse the response
    const responseData = await response.json();
    
    // Log the full response for debugging
    console.log('Template Creation Full Response:', JSON.stringify(responseData, null, 2));
    
    // Validate template creation response
    TemplateCreationValidation.validateTemplateCreation(responseData);
    
    // Successful response
    if (responseData.resource && responseData.resource.id) {
      templateJson.resource.id = responseData.resource.id;
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
  } catch (error) {
    // Enhanced error logging
    console.error('Detailed Template Creation Error:', {
      message: error.message,
      code: error.code,
      originalResponse: error.originalResponse,
      fullError: error
    });
    
    // Rethrow the error with a more informative message
    throw new Error(`Falha ao criar o template: ${error.message}`);
  }
};
