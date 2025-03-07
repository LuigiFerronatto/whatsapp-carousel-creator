// Os textos estão organizados por seções do componente:

// ============== INTRODUÇÃO ==============
const introducao = {
    stepTitle: "Template Concluído",
    stepDescription: "Seu template foi criado com sucesso. Agora você pode visualizar, obter o código JSON ou enviá-lo para teste."
  };
  
  // ============== ABAS DE VISUALIZAÇÃO ==============
  const abasVisualizacao = {
    visualTab: "Visualização",
    codeTab: "Código JSON",
    sendTab: "Enviar Template"
  };
  
  // ============== ABA DE VISUALIZAÇÃO ==============
  const abaVisualizacao = {
    previewTitle: "Pré-visualização do Template",
    previewSubtitle: "Veja como seu carrossel aparecerá no WhatsApp",
    templateName: "Nome do Template:",
    cards: "Cartões:",
    downloadPreviewAs: "Baixar pré-visualização como:",
    mp4Video: "Vídeo MP4",
    gifAnimation: "Animação GIF",
    downloadMp4Button: "Baixar Vídeo de Pré-visualização",
    downloadGifButton: "Baixar GIF de Pré-visualização",
    downloadStaticButton: "Baixar Imagem Estática",
    processingMessage: "Processando...",
    videoToolError: "Não foi possível carregar a ferramenta de geração de vídeo. Você ainda pode baixar uma imagem estática.",
    tryStaticInstead: "Usar Imagem Estática"
  };
  
  // ============== MENSAGENS DE STATUS DO DOWNLOAD ==============
  const statusDownload = {
    starting: "Iniciando geração...",
    loading: "Carregando ferramentas de vídeo...",
    capturing: "Capturando imagens...",
    processing: "Processando imagens...",
    encodingMp4: "Codificando vídeo...",
    encodingGif: "Criando GIF...",
    downloading: "Preparando download...",
    success: "Download concluído!",
    error: "Falha ao gerar pré-visualização. Tente novamente."
  };
  
  // ============== ABA DE CÓDIGO ==============
  const abaCodigo = {
    sendTemplateTitle: "JSON para Envio do Template",
    createTemplateTitle: "JSON para Criação do Template",
    builderTemplateTitle: "JSON para Conteúdo Dinâmico (Builder Blip)",
    copyJson: "Copiar JSON",
    copiedJson: "Copiado!",
    downloadJson: "Baixar JSON"
  };
  
  // ============== ABA DE ENVIO ==============
  const abaEnvio = {
    // Seção de visualização
    previewSectionTitle: "Visualização Final",
    
    // Seção de envio
    sendSectionTitle: "Testar Template",
    sendDescription: "Envie seu template para um número WhatsApp e veja-o em funcionamento",
    phoneLabel: "Número com código do país",
    phonePlaceholder: "5521999999999",
    phoneHelp: "Digite o número completo com código do país (ex: 5521999999999)",
    sendButton: "Enviar Template",
    
    // Mensagem de sucesso
    successTitle: "Template Enviado!",
    successMessage: "Template enviado com sucesso para:",
    successNote: "Se não receber o template, verifique se o número está correto e se o contato já enviou mensagem para sua conta WhatsApp Business.",
    sendToAnotherNumber: "Enviar para outro número"
  };
  
  // ============== BOTÕES DE AÇÃO ==============
  const botoesAcao = {
    backButton: "Voltar para Edição",
    newTemplateButton: "Criar Novo Template"
  };
  
  // ============== MENSAGENS DE STATUS DO PROCESSAMENTO DE FRAMES ==============
  const statusProcessamentoFrames = {
    processingFrame: (atual, total) => `Processando frame ${atual}/${total}...`
  };
  
  // Podemos exportar todos esses objetos para uso no componente