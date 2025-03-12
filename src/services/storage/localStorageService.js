// services/storage/localStorageService.js - CORRIGIDO
/**
 * Chave usada para armazenar o rascunho no localStorage
 */
const DRAFT_STORAGE_KEY = 'whatsapp_template_draft';

/**
 * Salva o estado atual como rascunho no localStorage
 * @param {Object} state - Estado atual do formulário
 * @returns {boolean} Indica se o salvamento foi bem sucedido
 */
export const saveDraft = (state) => {
  try {
    // Verificar se temos dados válidos
    if (!state) {
      console.warn('Tentativa de salvar rascunho com dados inválidos (state é null/undefined)');
      return false;
    }
    
    // Verificação adicional de campos obrigatórios
    if (!state.cards || !Array.isArray(state.cards) || state.cards.length === 0) {
      console.warn('Tentativa de salvar rascunho com cards inválidos');
      // Adicionar cards vazios se não existirem
      state.cards = state.cards || [];
    }
    
    // Converter para string antes de salvar, com tratamento para campos circulares
    // Usar uma versão segura para serialização
    const safeState = { ...state };
    
    // Certifique-se de que não estamos tentando serializar funções ou objetos circulares
    // O objeto state pode conter referencias circulares (funções, React contexts)
    Object.keys(safeState).forEach(key => {
      // Remover propriedades que não podem ser serializadas
      if (typeof safeState[key] === 'function' || 
          (typeof safeState[key] === 'object' && 
           key !== 'cards' && 
           key !== 'lastSavedTime' &&
           key !== 'numCards')) {
        delete safeState[key];
      }
    });
    
    const stateString = JSON.stringify(safeState);
    
    // Log para debug
    console.log(`Salvando rascunho com ${safeState.cards.length} cards ativos, numCards=${safeState.numCards}`);
    
    // Salvar no localStorage
    localStorage.setItem(DRAFT_STORAGE_KEY, stateString);
    
    // Verificar se o salvamento funcionou
    const savedItem = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedItem) {
      console.error('Falha ao salvar no localStorage: item não encontrado após salvamento');
      return false;
    }
    
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
      console.log('Nenhum rascunho encontrado no localStorage');
      return null;
    }
    
    // Converter de volta para objeto
    const state = JSON.parse(stateString);
    
    // Verificação básica de integridade
    if (!state || typeof state !== 'object') {
      console.warn('Rascunho carregado é inválido (não é um objeto)');
      return null;
    }
    
    // Garantir que cards seja um array
    if (!state.cards || !Array.isArray(state.cards)) {
      console.warn('Rascunho carregado tem cards inválidos');
      state.cards = [];
    }
    
    // Log para debug
    console.log(`Rascunho carregado com ${state.cards.length} cards, numCards=${state.numCards}`);
    
    return state;
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
    // Se houver erro, tente limpar o rascunho
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      console.log('Rascunho inválido removido após erro');
    } catch (e) {
      // Ignorar erro na limpeza
    }
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
    console.log('Rascunho removido com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar rascunho:', error);
    return false;
  }
};

/**
 * Verifica se há um rascunho salvo
 * @returns {boolean} Se existe um rascunho
 */
export const hasDraft = () => {
  try {
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    return !!draft;
  } catch (error) {
    console.error('Erro ao verificar rascunho:', error);
    return false;
  }
};