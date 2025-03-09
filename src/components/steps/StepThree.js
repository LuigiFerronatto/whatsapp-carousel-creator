// src/components/StepThree.js
import React, { useState, useRef, useEffect } from 'react';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import CarouselPreview from '../previews/CarouselPreview';
import Button from '../ui/Button/Button';
import JsonViewer from '../ui/JsonViewer/JsonViewer';
import { downloadPreview } from '../previews/downloadPreview';
import {
  FiChevronLeft,
  FiCopy,
  FiCheck,
  FiSend,
  FiCode,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiFilm,
  FiImage,
  FiAlertTriangle,
  FiPlayCircle
} from 'react-icons/fi';
import styles from './StepThree.module.css';
import steps from '../../styles/Steps.module.css';
import {
  CarouselControlProvider,
  useCarouselControl,
  withCarouselControl
} from '../previews/CarouselController';
import html2canvas from 'html2canvas';
import PreRenderStatus from '../ui/PreRenderStatus/PreRenderStatus';
import Input from '../ui/Input/Input';

// Conectar o CarouselPreview ao controlador para acesso programático
const ControlledCarouselPreview = withCarouselControl(CarouselPreview);

/**
 * Componente interno que gerencia a visualização do carrossel
 * Isso nos permite usar o hook useCarouselControl dentro do contexto do provider
 */
/**
 * Componente interno que gerencia a visualização do carrossel
 * Isso nos permite usar o hook useCarouselControl dentro do contexto do provider
 */
/**
 * Componente interno que gerencia a visualização do carrossel
 * Isso nos permite usar o hook useCarouselControl dentro do contexto do provider
 */
/**
 * Componente interno que gerencia a visualização do carrossel
 * Isso nos permite usar o hook useCarouselControl dentro do contexto do provider
 */
const PreviewContent = ({ 
  cards, 
  bodyText, 
  templateName, 
  finalJson,
  copyToClipboard,
  justCopied,
  handleCopy,
  handleDownload,
  downloadStatus,
  setDownloadStatus,
  isGeneratingPreview,
  setIsGeneratingPreview,
  previewFormat,
  setPreviewFormat
}) => {
  // Obter funções de controle do carrossel
  const { goToNextCard, goToPrevCard, goToCard, isInitialized, interactionDisabled } = useCarouselControl();
  const previewContainerRef = useRef(null);
  const [preRenderStarted, setPreRenderStarted] = useState(false);
  const [areDownloadButtonsDisabled, setAreDownloadButtonsDisabled] = useState(false);

  // Função para atualizar status com informações de progresso
  const updateStatusWithProgress = (status) => {
    setDownloadStatus({
      ...status,
      message: status.message || 'Processando...',
      progress: status.progress || 0
    });
  };

  // Verificar se os botões de download devem estar desabilitados
  useEffect(() => {
    // Os botões estarão desabilitados se:
    // 1. O carrossel não está inicializado, ou
    // 2. A interação está desabilitada (pré-renderização ativa), ou
    // 3. A pré-visualização está sendo gerada
    const shouldDisable = !isInitialized || interactionDisabled || isGeneratingPreview;
    setAreDownloadButtonsDisabled(shouldDisable);
  }, [isInitialized, interactionDisabled, isGeneratingPreview]);

  const preRenderAnimations = async () => {
    if (!isInitialized || !previewContainerRef.current) return;
    
    try {
      setPreRenderStarted(true);
      
      const navigationControls = {
        goToCard,
        goToNextCard,
        goToPrevCard
      };
      
      console.log("Iniciando pré-renderização em background...");
      
      // Gerar hash do template para identificação no localStorage
      const templateHash = downloadPreview.generateTemplateHash(cards, bodyText, templateName);
      
      // Iniciar a pré-renderização sem bloquear a interface
      setTimeout(async () => {
        try {
          await downloadPreview.preRenderAnimations(
            previewContainerRef.current,
            cards,
            bodyText,
            templateName,
            navigationControls,
            (status) => {
              console.log(`Pré-renderização: ${status.message || status.status} ${status.progress || ''}`);
            }
          );
        } catch (error) {
          console.error("Erro durante pré-renderização:", error);
          // Silenciosamente falha, já que é apenas otimização
        }
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao iniciar pré-renderização:", error);
    }
  };
  
  useEffect(() => {
    // Quando o carrossel estiver inicializado, comece a pré-renderização
    if (isInitialized && cards.length > 0) {
      preRenderAnimations();
    }
  }, [isInitialized, cards.length]);

  // Componente de pré-visualização automática
  const PreviewAutomation = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Iniciar reprodução automática da pré-visualização
    const startPreview = () => {
      if (!isInitialized || isGeneratingPreview || interactionDisabled) return;
      
      setIsPlaying(true);
      // Primeiro vamos para o primeiro card
      goToCard(0);
    };
    
    // Manipulador para quando a animação de pré-visualização terminar
    const handlePreviewComplete = () => {
      setIsPlaying(false);
      // Voltar para o primeiro card quando terminar
      setTimeout(() => goToCard(0), 300);
    };
    
    return (
      <div className={styles.previewAutomation}>
        <button 
          className={`${styles.previewButton} ${isPlaying ? styles.playing : ''}`}
          onClick={startPreview}
          disabled={isGeneratingPreview || !isInitialized || interactionDisabled}
        >
          <FiPlayCircle className={styles.playIcon} />
          {isPlaying ? 'Reproduzindo...' : 'Visualizar Animação'}
        </button>
        
        {isPlaying && (
          <ControlledCarouselPreview
            interval={1000} 
            autoPlay={true} 
            onComplete={handlePreviewComplete}
          />
        )}
      </div>
    );
  };

  // Função aprimorada para capturar sequência de frames
  const captureSequence = async () => {
    // Garantir que o carrossel está inicializado antes de começar
    if (!isInitialized) {
      setDownloadStatus({ 
        status: 'error', 
        message: 'O carrossel ainda não está inicializado. Tente novamente em instantes.' 
      });
      return;
    }
    
    // Gerar hash do template para verificação de cache
    const templateHash = downloadPreview.generateTemplateHash(cards, bodyText, templateName);
    
    setIsGeneratingPreview(true);
    
    try {
      // Primeiro verificar se já temos o blob em cache diretamente na memória
      if (downloadPreview.cachedFiles && downloadPreview.cachedFiles[previewFormat]) {
        setDownloadStatus({ 
          status: 'cached', 
          message: 'Usando arquivo em memória...',
          progress: 80
        });
          
        // Download diretamente do cache em memória
        const blob = downloadPreview.cachedFiles[previewFormat];
        const fileName = `${templateName || 'carrossel'}_preview.${previewFormat}`;
        
        setDownloadStatus({ status: 'downloading', message: 'Preparando download...', progress: 90 });
        await downloadPreview.downloadFile(blob, fileName);
        
        setDownloadStatus({ status: 'success', message: 'Download concluído!', progress: 100 });
        
        // Reset status após um delay
        setTimeout(() => {
          setDownloadStatus({ status: 'idle', message: '' });
        }, 3000);
        
        setIsGeneratingPreview(false);
        return;
      }
      
      // Se não temos em cache de memória, verificar localStorage
      if (downloadPreview.hasLocalStorageCache() && downloadPreview.isCompatibleTemplate(templateHash)) {
        setDownloadStatus({ 
          status: 'cached', 
          message: 'Usando frames do cache local...',
          progress: 30 
        });
      }
      
      // Se chegamos até aqui, precisamos gerar o formato solicitado
      
      // Criar um objeto com os controles de navegação para passar ao serviço de download
      const navigationControls = {
        goToCard,
        goToNextCard,
        goToPrevCard
      };
      
      // Verificar se já temos frames capturados em cache
      let frames;
      if (downloadPreview.capturedFramesCache) {
        setDownloadStatus({ 
          status: 'reusing', 
          message: 'Utilizando frames já capturados...',
          progress: 30
        });
        frames = downloadPreview.capturedFramesCache;
      } else {
        // Se não temos frames capturados, vamos capturar
        setDownloadStatus({ 
          status: 'capturing', 
          message: 'Preparando para capturar frames...',
          progress: 0
        });
        
        // Capturar os frames do carrossel, passando o elemento DOM e os controles de navegação
        frames = await downloadPreview.captureFrames(
          previewContainerRef.current,
          cards,
          navigationControls,
          updateStatusWithProgress,
          templateHash
        );
      }
      
      if (!frames || frames.length === 0) {
        throw new Error('Não foi possível capturar imagens do carrossel');
      }
      
      // Gerar no formato apropriado
      let blob;
      if (previewFormat === 'gif') {
        setDownloadStatus({ 
          status: 'processing', 
          message: 'Gerando GIF...', 
          progress: 50 
        });
        
        // Tentar 3 vezes com diferentes configurações em caso de erro
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            blob = await downloadPreview.generateGif(frames, templateName, updateStatusWithProgress);
            break; // Se funcionar, sair do loop
          } catch (gifError) {
            console.error(`Tentativa ${attempt} falhou:`, gifError);
            
            if (attempt === 3) {
              // Na última tentativa, propagar o erro
              throw gifError;
            }
            
            // Limpar o sistema de arquivos entre tentativas
            await downloadPreview.cleanupFileSystem();
            
            setDownloadStatus({ 
              status: 'retrying', 
              message: `Tentativa ${attempt} falhou, tentando novamente...`, 
              progress: 40 
            });
          }
        }
      } else {
        setDownloadStatus({ 
          status: 'processing', 
          message: 'Gerando vídeo...', 
          progress: 50 
        });
        blob = await downloadPreview.generateVideo(frames, templateName, updateStatusWithProgress);
      }
      
      // Download do arquivo
      setDownloadStatus({ 
        status: 'downloading', 
        message: 'Preparando download...', 
        progress: 90 
      });
      const fileName = `${templateName || 'carrossel'}_preview.${previewFormat}`;
      await downloadPreview.downloadFile(blob, fileName);
      
      setDownloadStatus({ 
        status: 'success', 
        message: 'Download concluído!',
        progress: 100 
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus({ status: 'idle', message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao gerar pré-visualização animada:', error);
      setDownloadStatus({
        status: 'error',
        message: `Falha ao gerar ${previewFormat.toUpperCase()}: ${error?.message || 'Erro desconhecido'}. Tente usar a opção de imagem estática.`
      });
    } finally {
      // Voltar para o primeiro card após a captura
      setTimeout(() => {
        if (isInitialized) {
          goToCard(0);
        }
      }, 500);
      
      setIsGeneratingPreview(false);
    }
  };

  // Método para limpar o cache quando o componente é montado
  useEffect(() => {
    // Limpar o cache quando mudam as propriedades que afetam o conteúdo
    downloadPreview.clearCache();
  }, [cards, bodyText, templateName]);

  // Método simplificado para capturar uma imagem estática
  const handleSimpleDownload = async () => {
    setIsGeneratingPreview(true);
    setDownloadStatus({ status: 'capturing', message: 'Capturando pré-visualização...' });
    
    try {
      const blob = await downloadPreview.generateStaticImage(previewContainerRef.current, templateName);
      
      const fileName = `${templateName || 'carrossel'}_preview.png`;
      await downloadPreview.downloadFile(blob, fileName);
      
      setDownloadStatus({ status: 'success', message: 'Download concluído!' });
      
      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus({ status: 'idle', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao capturar pré-visualização:', error);
      setDownloadStatus({
        status: 'error',
        message: 'Falha ao capturar pré-visualização. Tente novamente.'
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Se o componente está montado pela primeira vez, asseguramos que está no primeiro card
  // Usamos um useEffect para evitar atualização durante a renderização
  useEffect(() => {
    if (isInitialized) {
      // Pequeno atraso para garantir que o componente está totalmente montado
      setTimeout(() => {
        goToCard(0);
      }, 300);
    }
  }, [isInitialized]);

  return (
    <div className={styles.previewSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Visualização Final</h3>
        <p className={styles.previewDescription}>
          Este é o carrossel que seus clientes verão no WhatsApp. Deslize para ver todos os cartões.
        </p>
      </div>

      <div className={styles.previewContainer} ref={previewContainerRef}>
        {/* Usando o componente conectado ao controlador */}
        <ControlledCarouselPreview
          cards={cards}
          bodyText={bodyText}
        />
      </div>

      <div className={styles.templateInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Template:</span>
          <span className={styles.infoValue}>{templateName}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Cartões:</span>
          <span className={styles.infoValue}>{cards.length}</span>
        </div>

        <PreviewAutomation />
      </div>

      <div className={styles.previewActions}>
        <PreRenderStatus 
          downloadPreview={downloadPreview} 
          preRenderStarted={preRenderStarted} 
        />
        <div className={styles.downloadOptions}>
          <h4 className={styles.downloadTitle}>Salvar Visualização</h4>

          {downloadStatus.status === 'error' && downloadStatus.message.includes('ferramenta de geração de vídeo') ? (
            <div className={styles.ffmpegError}>
              <FiAlertTriangle className={styles.errorIcon} />
              <p>Não foi possível carregar a ferramenta de geração de vídeo. Você ainda pode baixar uma imagem estática.</p>
              <Button
                variant="outline"
                color="primary"
                onClick={handleSimpleDownload}
                loading={isGeneratingPreview}
                disabled={isGeneratingPreview || interactionDisabled}
                iconLeft={<FiDownload />}
              >
                Baixar Imagem Estática
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.formatSelector}>
                <span className={styles.formatLabel}>Formato:</span>
                <div className={styles.formatOptions}>
                  <button
                    className={`${styles.formatOption} ${previewFormat === 'mp4' ? styles.activeFormat : ''}`}
                    onClick={() => setPreviewFormat('mp4')}
                    disabled={areDownloadButtonsDisabled}
                  >
                    <FiFilm className={styles.formatIcon} />
                    Vídeo MP4
                  </button>
                  <button
                    className={`${styles.formatOption} ${previewFormat === 'gif' ? styles.activeFormat : ''}`}
                    onClick={() => setPreviewFormat('gif')}
                    disabled={areDownloadButtonsDisabled}
                  >
                    <FiImage className={styles.formatIcon} />
                    Animação GIF
                  </button>
                </div>
              </div>

              <Button
                variant="outline"
                color="primary"
                onClick={captureSequence}
                loading={isGeneratingPreview}
                disabled={areDownloadButtonsDisabled}
                iconLeft={<FiDownload />}
              >
                {isGeneratingPreview ?
                  `${downloadStatus.message || 'Processando...'}` :
                  `Baixar ${previewFormat === 'mp4' ? 'Vídeo' : 'GIF'}`
                }
              </Button>

              {downloadStatus.status !== 'idle' && (
                <div className={styles.statusIndicator}>
                  <div className={styles.statusMessage}>
                    {downloadStatus.message}
                  </div>
                  
                  {downloadStatus.progress > 0 && (
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${downloadStatus.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {downloadStatus.status === 'error' && (
                <div className={styles.downloadError}>
                  <FiAlertTriangle className={styles.errorIcon} />
                  <p>{downloadStatus.message}</p>
                  <button
                    className={styles.fallbackButton}
                    onClick={handleSimpleDownload}
                    disabled={areDownloadButtonsDisabled}
                  >
                    Usar Imagem Estática
                  </button>
                </div>
              )}

              {downloadStatus.status === 'success' && (
                <div className={styles.downloadSuccess}>
                  <FiCheck className={styles.successIcon} />
                  <p>{downloadStatus.message}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.jsonActions}>
          <h4 className={styles.jsonActionsTitle}>JSON do Template</h4>
          <div className={styles.actionsContainer}>
            <Button
              variant="outline"
              color="primary"
              onClick={() => handleCopy('sendTemplate')}
              iconLeft={justCopied.sendTemplate ? <FiCheck /> : <FiCopy />}
            >
              {justCopied.sendTemplate ? 'Copiado!' : 'Copiar JSON'}
            </Button>

            <Button
              variant="outline"
              color="primary"
              onClick={() => handleDownload('sendTemplate')}
              iconLeft={<FiDownload />}
            >
              Baixar JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * StepThree - Visualização final, exportação JSON e envio do template
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente StepThree
 */
const StepThree = ({
  // Existing props
  finalJson,
  copyToClipboard,
  resetForm,
  error,
  success,
  cards,
  bodyText,
  setStep,
  templateName,

  // Send-related props
  sendTemplate,
  loading
}) => {
  // State
  const [activeView, setActiveView] = useState('send');
  const [justCopied, setJustCopied] = useState({
    createTemplate: false,
    sendTemplate: false,
    builderTemplate: false
  });

  // Send-related state
  const [sendSuccess, setSendSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Preview-related state
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('mp4');
  const [downloadStatus, setDownloadStatus] = useState({ status: 'idle', message: '' });

  // Inicializar downloadPreview
  useEffect(() => {
    const initializeDownloadService = async () => {
      try {
        console.log('Tentando inicializar serviço de download...');
        // Pré-carregar FFmpeg em segundo plano sem bloquear a UI
        downloadPreview.preloadFFmpeg();
      } catch (error) {
        console.warn('Falha ao pré-carregar recursos:', error);
        
        // Mensagem mais amigável
        setDownloadStatus({
          status: 'error',
          message: 'Não foi possível carregar a ferramenta de geração de vídeo. Você ainda pode baixar uma imagem estática.'
        });
      }
    };

    initializeDownloadService();
  }, []);

  // Formatar telefone para exibição
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) return phone;

    // Tenta formatar com código do país, área e número
    try {
      const countryCode = cleaned.substring(0, 2);
      const areaCode = cleaned.substring(2, 4);
      const firstPart = cleaned.substring(4, 9);
      const secondPart = cleaned.substring(9);

      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    } catch (error) {
      // Em caso de erro, retorna o número limpo
      return cleaned;
    }
  };

  // Handle copy with visual feedback
  const handleCopy = (jsonType) => {
    copyToClipboard(jsonType);
    setJustCopied({
      ...justCopied,
      [jsonType]: true
    });

    setTimeout(() => {
      setJustCopied({
        ...justCopied,
        [jsonType]: false
      });
    }, 2000);
  };

  // Handle download JSON
  const handleDownload = (jsonType) => {
    // Verifica se há um JSON válido para download
    if (!finalJson || !finalJson[jsonType]) {
      console.error(`Tipo de JSON "${jsonType}" não disponível para download`);
      return;
    }

    try {
      // Cria um blob com o conteúdo JSON formatado
      const jsonContent = JSON.stringify(finalJson[jsonType], null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Cria um elemento de link e ativa o download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'template'}_${jsonType}.json`;
      document.body.appendChild(link);
      link.click();

      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Erro ao fazer download do JSON:', error);
      alert('Falha ao baixar o JSON. Por favor, tente novamente.');
    }
  };

  return (
    <div className={steps.container}>
      {/* Introduction section */}
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>Template Concluído</h2>
        <p className={steps.stepDescription}>
          Seu template foi criado com sucesso! Veja abaixo a prévia de como ficará para seus clientes,
          faça download para compartilhar com sua equipe ou envie para um número de teste.
        </p>
      </div>

      {/* View tabs */}
      <div className={styles.viewTabs}>
        <button
          className={`${styles.viewTab} ${activeView === 'send' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('send')}
        >
          <FiSend className={styles.tabIcon} />
          Visualização e Envio
        </button>
        <button
          className={`${styles.viewTab} ${activeView === 'code' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('code')}
        >
          <FiCode className={styles.tabIcon} />
          Código JSON
        </button>
      </div>

      {/* Content based on active tab */}
      <div className={styles.viewContent}>
        {/* Send Template Tab com Visualização Integrada */}
        {activeView === 'send' && (
          <div className={styles.sendView}>
            <div className={styles.contentWrapper}>
              {/* Envolver o conteúdo de visualização no provider */}
              <CarouselControlProvider>
                <PreviewContent
                  cards={cards}
                  bodyText={bodyText}
                  templateName={templateName}
                  finalJson={finalJson}
                  copyToClipboard={copyToClipboard}
                  justCopied={justCopied}
                  handleCopy={handleCopy}
                  handleDownload={handleDownload}
                  downloadStatus={downloadStatus}
                  setDownloadStatus={setDownloadStatus}
                  isGeneratingPreview={isGeneratingPreview}
                  setIsGeneratingPreview={setIsGeneratingPreview}
                  previewFormat={previewFormat}
                  setPreviewFormat={setPreviewFormat}
                />
              </CarouselControlProvider>

              {/* Coluna de Envio */}
              <div className={styles.sendSection}>
                {!sendSuccess ? (
                  <>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Testar Template</h3>
                      <p className={styles.sendDescription}>
                        Envie seu template para um número WhatsApp para confirmar como ele será exibido para seus clientes
                      </p>
                    </div>

                    <div className={styles.formGroup}>
                        <Input
                          label="Número do WhatsApp"
                          variant="phoneNumber"
                          className={styles.phoneInput}
                          value={phoneNumber || ''}
                          onChange={(e) => {
                            // Extrai apenas os dígitos do valor inserido
                            const digitsOnly = e.target.value.replace(/\D/g, '');
                            setPhoneNumber(digitsOnly);
                          }}
                          placeholder="5521999999999"
                          />
                    </div>

                    <div className={styles.sendButtonContainer}>
                      <Button
                        variant="solid"
                        color="primary"
                        onClick={async () => {
                          try {
                            await sendTemplate(phoneNumber);
                            setSendSuccess(true);
                          } catch (error) {
                            console.error('Erro ao enviar template:', error);
                          }
                        }}
                        disabled={!phoneNumber || loading}
                        loading={loading}
                        iconLeft={<FiSend />}
                        fullWidth
                      >
                        Enviar Template
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                      <FiCheckCircle size={40} />
                    </div>

                    <h3 className={styles.successTitle}>Template Enviado!</h3>

                    <p className={styles.successMessage}>
                      Template enviado com sucesso para:
                    </p>

                    <div className={styles.phoneDisplay}>
                      {formatPhoneDisplay(phoneNumber)}
                    </div>

                    <p className={styles.successNote}>
                      Verifique o recebimento no dispositivo. Se não receber em alguns instantes,
                      confirme se o número está correto e se o contato já enviou mensagem para sua
                      conta WhatsApp Business.
                    </p>

                    <Button
                      variant="outline"
                      color="primary"
                      onClick={() => {
                        setSendSuccess(false);
                        setPhoneNumber('');
                      }}
                      iconLeft={<FiRefreshCw />}
                    >
                      Enviar para outro número
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Code View Tab - Existing functionality */}
        {activeView === 'code' && (
          <div className={styles.codeView}>
            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <h3 className={styles.codeSectionTitle}>JSON para Envio do Template</h3>
                <p className={styles.codeSectionDescription}>
                  Use este JSON para enviar seu template através da API do WhatsApp.
                </p>
              </div>
              <div className={styles.jsonViewerWrapper}>
                <JsonViewer
                  json={finalJson.sendTemplate}
                  fileName={`${templateName || 'template'}_sendTemplate.json`}
                  onCopy={() => handleCopy('sendTemplate')}
                  onDownload={() => handleDownload('sendTemplate')}
                />
              </div>
            </div>

            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <h3 className={styles.codeSectionTitle}>JSON para Criação do Template</h3>
                <p className={styles.codeSectionDescription}>
                  Use este JSON para registrar seu template no WhatsApp.
                </p>
              </div>
              <div className={styles.jsonViewerWrapper}>
                <JsonViewer
                  json={finalJson.createTemplate}
                  fileName={`${templateName || 'template'}_createTemplate.json`}
                  onCopy={() => handleCopy('createTemplate')}
                  onDownload={() => handleDownload('createTemplate')}
                />
              </div>
            </div>

            {/* Novo formato para Builder Blip */}
            <div className={styles.codeSection}>
              <div className={styles.codeSectionHeader}>
                <h3 className={styles.codeSectionTitle}>JSON para Conteúdo Dinâmico (Builder Blip)</h3>
                <p className={styles.codeSectionDescription}>
                  Use este JSON para integrar seu template na plataforma Blip.
                </p>
              </div>
              <div className={styles.jsonViewerWrapper}>
                <JsonViewer
                  json={finalJson.builderTemplate}
                  fileName={`${templateName || 'template'}_builderTemplate.json`}
                  onCopy={() => handleCopy('builderTemplate')}
                  onDownload={() => handleDownload('builderTemplate')}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className={styles.actionButtons}>
        <button
          className={styles.backButton}
          onClick={() => setStep(2)}
        >
          <FiChevronLeft />
          Voltar para Edição
        </button>

        <button
          className={styles.newTemplateButton}
          onClick={resetForm}
        >
          Criar Novo Template
        </button>
      </div>

      {/* Error and success messages */}
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
    </div>
  );
};

export default StepThree;