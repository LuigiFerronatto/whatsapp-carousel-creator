// Modificação do src/services/storage/localStorageService.js
/**
 * Chave usada para armazenar o rascunho no localStorage
 */
const DRAFT_STORAGE_KEY = 'whatsapp_template_draft';

/**
 * Obtém informações resumidas sobre o rascunho salvo
 * @returns {Object|null} Informações resumidas do rascunho ou null se não existir
 */
export const getDraftInfo = () => {
  try {
    // Obter a string do localStorage
    const stateString = localStorage.getItem(DRAFT_STORAGE_KEY);
    
    // Se não existir, retornar null
    if (!stateString) {
      return null;
    }
    
    // Converter de volta para objeto e extrair apenas informações básicas
    const state = JSON.parse(stateString);
    
    return {
      templateName: state.templateName,
      numCards: state.numCards,
      lastSavedTime: state.lastSavedTime,
      hasCards: Array.isArray(state.cards) && state.cards.length > 0
    };
  } catch (error) {
    console.error('Erro ao obter informações do rascunho:', error);
    return null;
  }
};

/**
 * Salva o estado atual como rascunho no localStorage
 * @param {Object} state - Estado atual do formulário
 * @returns {boolean} Indica se o salvamento foi bem sucedido
 */
export const saveDraft = (state) => {
  try {
    // Verificar se temos dados válidos
    if (!state || !state.templateName) {
      console.warn('Tentativa de salvar rascunho com dados inválidos');
      return false;
    }
    
    // Converter para string antes de salvar
    const stateString = JSON.stringify(state);
    
    // Salvar no localStorage
    localStorage.setItem(DRAFT_STORAGE_KEY, stateString);
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
    return false;
  }
};

/**
 * Carrega o rascunho salvo do localStorage
 * @returns {Object|null} Estado salvo ou null se não existir
 */
export const loadDraft = () => {
  try {
    // Obter a string do localStorage
    const stateString = localStorage.getItem(DRAFT_STORAGE_KEY);
    
    // Se não existir, retornar null
    if (!stateString) {
      return null;
    }
    
    // Converter de volta para objeto
    const state = JSON.parse(stateString);
    
    return state;
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
    return null;
  }
};

/**
 * Limpa o rascunho salvo do localStorage
 * @returns {boolean} Indica se a limpeza foi bem sucedida
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar rascunho:', error);
    return false;
  }
};