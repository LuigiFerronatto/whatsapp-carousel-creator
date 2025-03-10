// services/storage/localStorageService.js - Versão corrigida

/**
 * Salva um rascunho no localStorage com verificações de segurança
 * Versão melhorada com melhor preservação de fileHandles e tratamento de erros
 * @param {Object} state Estado a ser salvo
 * @returns {boolean} Indica se o salvamento foi bem-sucedido
 */
export const saveDraft = (state) => {
  try {
    // Validar se o estado não está vazio
    if (!state || Object.keys(state).length === 0) {
      console.warn('Tentativa de salvar rascunho vazio');
      return false;
    }

    // Garantir que os fileHandles sejam preservados para cada card
    const cardsWithFileHandles = state.cards?.map(card => {
      // Verificar se há um fileHandle válido
      const hasValidFileHandle = card.fileHandle && typeof card.fileHandle === 'string' && card.fileHandle.length > 0;
      
      // Preserva o fileHandle e adiciona flag para pular upload
      return {
        ...card,
        fileHandle: hasValidFileHandle ? card.fileHandle : '', // Garante que fileHandle nunca seja undefined
        fileUploadSkippable: hasValidFileHandle && card.fileUrl ? true : false // Flag para saber se podemos pular o upload
      };
    }) || [];

    // Adicionar timestamp de criação e preservar fileHandles
    const draftWithTimestamp = {
      ...state,
      cards: cardsWithFileHandles,
      createdAt: state.createdAt || Date.now(),
      lastUpdated: Date.now()
    };

    console.log('Salvando estado do rascunho:', { 
      templateName: draftWithTimestamp.templateName,
      cards: `${draftWithTimestamp.cards.length} cards`,
      authKey: draftWithTimestamp.authKey ? '(definido)' : '(não definido)',
      lastUpdated: new Date(draftWithTimestamp.lastUpdated).toLocaleString()
    });

    // Certificar-se de que o objeto é serializável (sem referências circulares)
    try {
      const draftString = JSON.stringify(draftWithTimestamp);
      
      // Verificar limite de localStorage
      try {
        localStorage.setItem('whatsapp_template_draft', draftString);
        localStorage.setItem('draft_last_saved_time', new Date().toISOString());
        return true;
      } catch (storageError) {
        // Tratar erros de armazenamento
        if (storageError instanceof DOMException && 
            (storageError.name === 'QuotaExceededError' || 
             storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          console.error('Limite de armazenamento local excedido');
          
          // Limpar rascunhos antigos para liberar espaço
          clearOldDrafts();
          
          // Tentar salvar novamente
          try {
            localStorage.setItem('whatsapp_template_draft', draftString);
            localStorage.setItem('draft_last_saved_time', new Date().toISOString());
            return true;
          } catch {
            console.error('Falha ao salvar rascunho mesmo após limpar rascunhos antigos');
            return false;
          }
        }
        console.error('Erro de armazenamento:', storageError);
        return false;
      }
    } catch (jsonError) {
      console.error('Erro ao serializar o rascunho:', jsonError);
      
      // Tentar salvar uma versão simplificada do rascunho
      try {
        const simplifiedDraft = {
          templateName: state.templateName || '',
          language: state.language || 'pt_BR',
          bodyText: state.bodyText || '',
          cards: cardsWithFileHandles.map(card => ({
            fileUrl: card.fileUrl || '',
            fileType: card.fileType || 'image',
            fileHandle: card.fileHandle || '',
            bodyText: card.bodyText || '',
            buttons: (card.buttons || []).map(btn => ({
              type: btn.type || 'QUICK_REPLY',
              text: btn.text || '',
              url: btn.url || '',
              phoneNumber: btn.phoneNumber || '',
              payload: btn.payload || ''
            }))
          })),
          authKey: state.authKey || '',
          createdAt: state.createdAt || Date.now(),
          lastUpdated: Date.now()
        };
        
        const simplifiedString = JSON.stringify(simplifiedDraft);
        localStorage.setItem('whatsapp_template_draft', simplifiedString);
        localStorage.setItem('draft_last_saved_time', new Date().toISOString());
        return true;
      } catch (fallbackError) {
        console.error('Erro ao salvar versão simplificada do rascunho:', fallbackError);
        return false;
      }
    }
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
    return false;
  }
};

/**
 * Carrega o rascunho do localStorage com verificações adicionais
 * Versão melhorada para validar corretamente fileHandles e tratar dados incompletos
 */
export const loadDraft = () => {
  try {
    const draftString = localStorage.getItem('whatsapp_template_draft');
    
    if (!draftString) {
      return null;
    }

    // Parse do rascunho
    const draft = JSON.parse(draftString);

    // Verificar idade do rascunho
    const MAX_DRAFT_AGE = 30 * 24 * 60 * 60 * 1000; // 30 dias
    if (draft.createdAt && (Date.now() - draft.createdAt > MAX_DRAFT_AGE)) {
      console.warn('Rascunho expirado. Removendo...');
      localStorage.removeItem('whatsapp_template_draft');
      return null;
    }

    // Processar os cards para garantir que fileHandles sejam mantidos
    const processedCards = draft.cards?.map(card => {
      // Verificar se há um fileHandle válido
      const hasValidFileHandle = card.fileHandle && typeof card.fileHandle === 'string' && card.fileHandle.length > 0;
      
      return {
        fileUrl: card.fileUrl || '',
        fileType: card.fileType || 'image',
        fileHandle: hasValidFileHandle ? card.fileHandle : '',
        bodyText: card.bodyText || '',
        buttons: card.buttons || [{ type: 'QUICK_REPLY', text: '', payload: '' }],
        fileUploadSkippable: hasValidFileHandle && card.fileUrl ? true : false
      };
    });

    // Filtrar e limpar campos indesejados
    const cleanDraft = {
      templateName: draft.templateName || '',
      language: draft.language || 'pt_BR',
      bodyText: draft.bodyText || '',
      cards: processedCards && processedCards.length >= 2 ? processedCards : null,
      authKey: draft.authKey || '',
      lastSavedTime: draft.lastSavedTime || draft.lastUpdated || new Date().toISOString()
    };

    console.log('Rascunho carregado:', { 
      templateName: cleanDraft.templateName,
      language: cleanDraft.language,
      cards: cleanDraft.cards ? `${cleanDraft.cards.length} cards` : 'nenhum',
      bodyText: cleanDraft.bodyText ? 'presente' : 'não definido',
      authKey: cleanDraft.authKey ? 'presente' : 'não definido',
      lastSavedTime: cleanDraft.lastSavedTime
    });

    return cleanDraft;
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
    // Limpar rascunho inválido
    localStorage.removeItem('whatsapp_template_draft');
    return null;
  }
};

/**
 * Limpa rascunhos antigos do localStorage
 */
const clearOldDrafts = () => {
  try {
    // Remove todos os rascunhos relacionados ao template
    localStorage.removeItem('whatsapp_template_draft');
    localStorage.removeItem('draft_last_saved_time');
    localStorage.removeItem('last_draft_identifier');
  } catch (error) {
    console.error('Erro ao limpar rascunhos:', error);
  }
};

/**
 * Limpa completamente o rascunho atual
 */
export const clearDraft = () => {
  try {
    clearOldDrafts();
    console.log('Rascunho limpo com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar rascunho:', error);
    return false;
  }
};