// services/storage/localStorageService.js

/**
 * Salva um rascunho no armazenamento local
 * @param {Object} data - Dados a serem salvos
 * @returns {boolean} Verdadeiro se salvo com sucesso
 */
export const saveDraft = (data) => {
  try {
    localStorage.setItem('whatsapp_carousel_draft', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
    return false;
  }
};

/**
 * Carrega um rascunho do armazenamento local
 * @returns {Object|null} Dados carregados ou null se não existir
 */
export const loadDraft = () => {
  try {
    const saved = localStorage.getItem('whatsapp_carousel_draft');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
    return null;
  }
};

/**
 * Remove o rascunho do armazenamento local
 * @returns {boolean} Verdadeiro se removido com sucesso
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem('whatsapp_carousel_draft');
    return true;
  } catch (error) {
    console.error('Erro ao limpar rascunho:', error);
    return false;
  }
};