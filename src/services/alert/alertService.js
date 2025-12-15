// services/alert/alertService.js
/**
 * AlertService - Centraliza mensagens e lógica de exibição de alertas
 * Para uso com o useAlert ou useAlertSafe
 */

// Constantes de mensagens - mantenha todas as mensagens da aplicação aqui
export const ALERT_MESSAGES = {
    // Mensagens gerais
    GENERIC_ERROR: 'Ocorreu um erro. Por favor, tente novamente.',
    GENERIC_SUCCESS: 'Operação realizada com sucesso!',
    GENERIC_WARNING: 'Atenção! Verifique os campos antes de continuar.',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
    PERMISSION_DENIED: 'Você não tem permissão para realizar esta operação.',
    
    // Draft/Rascunho
    DRAFT_SAVED: 'Rascunho salvo com sucesso!',
    DRAFT_SAVED_FALLBACK: 'Rascunho salvo com mecanismo alternativo!',
    DRAFT_SAVE_ERROR: 'Não foi possível salvar o rascunho.',
    DRAFT_LOAD_SUCCESS: 'Rascunho anterior carregado com sucesso!',
    DRAFT_LOAD_ERROR: 'Erro ao carregar rascunho anterior.',
    DRAFT_CLEARED: 'Rascunho removido com sucesso.',
    
    // Auth/Keys
    AUTH_KEY_REQUIRED: 'Chave de autorização (Router Key) é obrigatória para continuar.',
    AUTH_KEY_SAVED: 'Chave de autorização salva com sucesso!',
    AUTH_KEY_INVALID: 'Chave de autorização inválida ou incorreta.',
    
    // Card Management
    CARD_URLS_REQUIRED: 'Adicione arquivos para todos os cards antes de continuar.',
    CARD_URLS_INVALID: 'Um ou mais URLs de arquivos são inválidos.',
    CARD_ADDED: 'Card adicionado com sucesso!',
    CARD_REMOVED: 'Card removido com sucesso!',
    CARD_MAX_LIMIT: 'Número máximo de cards (10) atingido!',
    CARD_MIN_LIMIT: 'Número mínimo de cards (2) atingido!',
    CARD_UPDATED: 'Card atualizado com sucesso!',
    
    // File Upload
    UPLOAD_STARTED: 'Iniciando processo de upload...',
    UPLOAD_SUCCESS: 'Upload de arquivos concluído com sucesso!',
    UPLOAD_PROGRESS: 'Upload em progresso: {0}%',
    UPLOAD_ERROR: 'Erro no upload dos arquivos: {0}',
    UPLOAD_CACHE_USED: '{0} arquivo(s) carregado(s) do cache.',
    UPLOAD_PARTIAL: '{0} arquivo(s) enviado(s) e {1} carregado(s) do cache.',
    UPLOAD_COMPLETE: '{0} arquivo(s) enviado(s) com sucesso.',
    FILE_TYPE_ERROR: 'Tipo de arquivo não suportado: {0}',
    FILE_SIZE_ERROR: 'Arquivo muito grande: {0}. Limite: {1}',
    
    // Template Creation
    TEMPLATE_NAME_REQUIRED: 'Nome do template é obrigatório.',
    TEMPLATE_NAME_SHORT: 'Nome do template deve ter pelo menos 3 caracteres.',
    TEMPLATE_NAME_APPLIED: 'Nome do template aplicado!',
    TEMPLATE_CREATED: 'Template criado com sucesso!',
    TEMPLATE_CREATION_ERROR: 'Erro ao criar template: {0}',
    TEMPLATE_EXIST_ERROR: 'Já existe um template com este nome.',
    TEMPLATE_BODY_REQUIRED: 'A mensagem de introdução é obrigatória.',
    TEMPLATE_BODY_LONG: 'Texto do corpo excede o limite de 1024 caracteres.',
    TEMPLATE_RESET: 'Template resetado. Você pode começar um novo template agora.',
    TEMPLATE_SENT: 'Template enviado com sucesso para {0}!',
    TEMPLATE_SEND_ERROR: 'Erro no envio do template: {0}',
    PHONE_REQUIRED: 'Número de telefone é obrigatório para enviar o template.',
    
    // Button Management
    BUTTON_TEXT_REQUIRED: 'Texto do botão é obrigatório.',
    BUTTON_URL_REQUIRED: 'URL do botão é obrigatório.',
    BUTTON_PHONE_REQUIRED: 'Número de telefone do botão é obrigatório.',
    BUTTON_MAX_LIMIT: 'O WhatsApp permite no máximo 2 botões por card.',
    BUTTON_ADDED: 'Botão adicionado com sucesso!',
    BUTTON_REMOVED: 'Botão removido com sucesso!',
    BUTTON_SYNC_WARNING: 'Alterações nos botões serão sincronizadas em todos os cards.',
    BUTTON_CONSISTENCY_WARNING: 'Os cards possuem configurações diferentes de botões, o que não é permitido pelo WhatsApp.',
    BUTTON_STANDARDIZED: 'Botões padronizados com sucesso!',
    BUTTON_TYPE_SYNCED: 'Tipo de botão sincronizado em todos os cards: {0}',
    
    // Validation
    VALIDATION_ERROR: 'Por favor, corrija os erros antes de continuar.',
    VALIDATION_ERRORS_FOUND: 'Problemas de validação encontrados:\n{0}',
    
    // Preview/Export
    PREVIEW_GENERATING: 'Gerando {0}...',
    PREVIEW_SUCCESS: '{0} gerado com sucesso!',
    PREVIEW_ERROR: 'Erro na geração do {0}: {1}',
    PREVIEW_DOWNLOAD_STARTED: 'Download iniciado...',
    PREVIEW_DOWNLOAD_COMPLETE: 'Download concluído!',
    PREVIEW_CACHED: 'Usando arquivo em memória...',
    PREVIEW_CACHE_FRAMES: 'Usando frames do cache local...',
    JSON_COPIED: 'JSON do tipo "{0}" copiado para a área de transferência',
    JSON_DOWNLOAD_SUCCESS: 'JSON "{0}" baixado com sucesso',
    JSON_DOWNLOAD_ERROR: 'Falha ao baixar o JSON. {0}',
    JSON_NOT_AVAILABLE: 'Tipo de JSON "{0}" não disponível para download',
    
    // Outros
    PRE_RENDER_COMPLETE: 'Pré-renderização concluída. O download será mais rápido agora!',
    FFMPEG_LOAD_ERROR: 'Não foi possível carregar as ferramentas de vídeo. A opção de imagem estática ainda está disponível.',
    NEW_TEMPLATE_ALERT: 'Iniciando um novo template. Dados anteriores foram limpos.'
  };
  
  /**
   * Formatador de mensagens - substitui tokens {0}, {1}, etc. por valores
   * @param {string} message - Mensagem com tokens {0}, {1}, etc.
   * @param  {...any} args - Valores para substituir os tokens
   * @returns {string} - Mensagem formatada
   */
  const formatMessage = (message, ...args) => {
    if (!message) return '';
    
    return message.replace(/{(\d+)}/g, (match, index) => {
      const argIndex = parseInt(index, 10);
      return args[argIndex] !== undefined ? args[argIndex] : match;
    });
  };
  
  /**
   * Configurações padrão por tipo de alerta
   */
  const DEFAULT_CONFIGS = {
    success: {
      position: 'bottom-right',
      autoCloseTime: 3000
    },
    error: {
      position: 'top-center',
      autoCloseTime: 7000
    },
    warning: {
      position: 'top-center',
      autoCloseTime: 5000
    },
    info: {
      position: 'bottom-right',
      autoCloseTime: 3000
    }
  };
  
  /**
   * Cria o serviço de alertas
   * @param {Object} alertHook - Hook de alerta (useAlert ou useAlertSafe)
   * @returns {Object} - Serviço de alertas
   */
  export const createAlertService = (alertHook) => {
    if (!alertHook) {
      console.error('AlertService: Hook de alerta não fornecido');
      // Criar um fallback para não quebrar a aplicação
      return {
        success: (msg) => console.log('SUCCESS:', msg),
        error: (msg) => console.error('ERROR:', msg),
        warning: (msg) => console.warn('WARNING:', msg),
        info: (msg) => console.info('INFO:', msg)
      };
    }
    
    /**
     * Função genérica para mostrar alerta 
     * @param {string} type - Tipo do alerta (success, error, warning, info)
     * @param {string} messageKey - Chave da mensagem em ALERT_MESSAGES
     * @param {Object} options - Opções do alerta
     * @param  {...any} args - Argumentos para formatação da mensagem
     * @returns {*} - Resultado do método de alerta usado
     */
    const showAlert = (type, messageKey, options = {}, ...args) => {
      // Se a chave não existir, usar a mensagem diretamente (para retrocompatibilidade)
      const messageTemplate = ALERT_MESSAGES[messageKey] || messageKey;
      const message = formatMessage(messageTemplate, ...args);
      
      // Mesclar configurações padrão com as opções fornecidas
      const config = { ...DEFAULT_CONFIGS[type], ...options };
      
      // Log para debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`Alert [${type}]: ${message}`);
      }
      
      // Chamar o método correspondente do hook de alerta
      return alertHook[type](message, config);
    };
    
    // Objeto de serviço com métodos por tipo
    return {
      /**
       * Mostra um alerta de sucesso
       * @param {string} messageKey - Chave da mensagem ou mensagem direta
       * @param {Object} options - Opções do alerta (position, autoCloseTime, etc.)
       * @param  {...any} args - Argumentos para formatação da mensagem
       */
      success: (messageKey, options = {}, ...args) => 
        showAlert('success', messageKey, options, ...args),
      
      /**
       * Mostra um alerta de erro
       * @param {string} messageKey - Chave da mensagem ou mensagem direta
       * @param {Object} options - Opções do alerta (position, autoCloseTime, etc.)
       * @param  {...any} args - Argumentos para formatação da mensagem
       */
      error: (messageKey, options = {}, ...args) => 
        showAlert('error', messageKey, options, ...args),
      
      /**
       * Mostra um alerta de aviso
       * @param {string} messageKey - Chave da mensagem ou mensagem direta
       * @param {Object} options - Opções do alerta (position, autoCloseTime, etc.)
       * @param  {...any} args - Argumentos para formatação da mensagem
       */
      warning: (messageKey, options = {}, ...args) => 
        showAlert('warning', messageKey, options, ...args),
      
      /**
       * Mostra um alerta informativo
       * @param {string} messageKey - Chave da mensagem ou mensagem direta
       * @param {Object} options - Opções do alerta (position, autoCloseTime, etc.)
       * @param  {...any} args - Argumentos para formatação da mensagem
       */
      info: (messageKey, options = {}, ...args) => 
        showAlert('info', messageKey, options, ...args),
      
      /**
       * Remove um alerta específico
       * @param {string} id - ID do alerta a ser removido
       */
      remove: (id) => {
        if (alertHook.remove) {
          alertHook.remove(id);
        }
      },
      
      /**
       * Acesso direto às constantes de mensagens
       */
      messages: ALERT_MESSAGES
    };
  };
  
  /**
   * Hook para usar o serviço de alertas em componentes
   * @param {Object} alertHook - Hook de alerta (useAlert ou useAlertSafe)
   * @returns {Object} - Serviço de alertas
   */
  export const useAlertService = (alertHook) => {
    return createAlertService(alertHook);
  };