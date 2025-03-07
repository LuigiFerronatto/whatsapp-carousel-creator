import React, { useState, useRef, useEffect } from 'react';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import CarouselPreview from '../previews/CarouselPreview';
import Button from '../ui/Button/Button';
import JsonViewer from '../ui/JsonViewer/JsonViewer';
import html2canvas from 'html2canvas';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { toBlobURL } from '@ffmpeg/util';
import { 
  FiChevronLeft, 
  FiCopy, 
  FiCheck, 
  FiSend, 
  FiCode, 
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiFilm,
  FiImage,
  FiAlertTriangle
} from 'react-icons/fi';
import styles from './StepThree.module.css';
import steps from '../../styles/Steps.module.css';

// Initialize FFmpeg
const ffmpeg = new FFmpeg();

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
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegError, setFfmpegError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({ status: 'idle', message: '' });

  // Refs
  const carouselRef = useRef(null);
  const previewFramesRef = useRef([]);

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        // Use more robust loading mechanism
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}ffmpeg-core.worker.js`, 'text/javascript')
        });
        
        console.log('FFmpeg carregado com sucesso');
        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar FFmpeg:', error);
        setFfmpegError(error.message || 'Não foi possível carregar a ferramenta de geração de vídeo');
        setFfmpegLoaded(false);
      }
    };
  
    loadFFmpeg();
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

  // Capture carousel frames for animation
  const captureCarouselFrames = async () => {
    if (!carouselRef.current) {
      setDownloadStatus({ 
        status: 'error', 
        message: 'Container de pré-visualização não encontrado. Tente novamente.' 
      });
      return [];
    }
  
    setDownloadStatus({ status: 'capturing', message: 'Capturando imagens...' });
    const frames = [];
    const numCards = cards.length;
  
    try {
      // Capture initial state
      const initialFrame = await html2canvas(carouselRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      frames.push(initialFrame);
    
      // Capture frames for each card transition
      for (let i = 1; i < numCards; i++) {
        // Wait for transition
        await new Promise(resolve => setTimeout(resolve, 100));
      
        // Capture frame
        const frame = await html2canvas(carouselRef.current, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        frames.push(frame);
      }
    
      setDownloadStatus({ status: 'processing', message: 'Processando imagens...' });
      return frames;
    } catch (error) {
      console.error('Erro ao capturar frames do carrossel:', error);
      setDownloadStatus({ 
        status: 'error', 
        message: 'Falha ao capturar imagens. Tente novamente.' 
      });
      return [];
    }
  };

  // Generate animated preview
  const generateAnimatedPreview = async () => {
    setIsGeneratingPreview(true);
    setDownloadStatus({ status: 'starting', message: 'Iniciando geração...' });
  
    try {
      // Check if FFmpeg is loaded
      if (!ffmpegLoaded) {
        setDownloadStatus({ status: 'loading', message: 'Carregando ferramentas de vídeo...' });
        
        // Try to load FFmpeg again
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}ffmpeg-core.worker.js`, 'text/javascript')
        });
        
        setFfmpegLoaded(true);
      }
    
      // Capture frames
      const frames = await captureCarouselFrames();
      previewFramesRef.current = frames;
    
      if (frames.length === 0) {
        throw new Error('Falha ao capturar frames do carrossel');
      }
    
      // Generate the appropriate format
      if (previewFormat === 'gif') {
        await generateGif(frames);
      } else {
        await generateMp4(frames);
      }
    
      setDownloadStatus({ status: 'success', message: 'Download concluído!' });
      
      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus({ status: 'idle', message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao gerar pré-visualização:', error);
      setDownloadStatus({ 
        status: 'error', 
        message: `Falha ao gerar ${previewFormat.toUpperCase()}: ${error.message}` 
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Generate GIF from frames
  const generateGif = async (frames) => {
    try {
      setDownloadStatus({ status: 'processing', message: 'Criando GIF...' });
      
      // Create a temporary directory
      await ffmpeg.createDir('frames');
      
      // Write frames to FFmpeg virtual file system
      for (let i = 0; i < frames.length; i++) {
        setDownloadStatus({ 
          status: 'processing', 
          message: `Processando frame ${i+1}/${frames.length}...` 
        });
        
        const dataUrl = frames[i].toDataURL('image/png');
        const fileName = `frames/frame_${i.toString().padStart(3, '0')}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(dataUrl));
      }
    
      setDownloadStatus({ status: 'encodingGif', message: 'Criando GIF...' });
      
      // Generate GIF using FFmpeg
      await ffmpeg.exec([
        '-framerate', '3',
        '-pattern_type', 'glob',
        '-i', 'frames/frame_*.png',
        '-vf', 'scale=400:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        'output.gif'
      ]);
    
      setDownloadStatus({ status: 'downloading', message: 'Preparando download...' });
      
      // Read the output file
      const data = await ffmpeg.readFile('output.gif');
    
      // Create download link
      const blob = new Blob([data.buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'carrossel'}_preview.gif`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
    
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Erro ao gerar GIF:', error);
      throw new Error(`Falha na geração do GIF: ${error.message}`);
    }
  };
  
  // Generate MP4 from frames
  const generateMp4 = async (frames) => {
    try {
      setDownloadStatus({ status: 'processing', message: 'Criando MP4...' });
      
      // Create a temporary directory
      await ffmpeg.createDir('frames');
      
      // Write frames to FFmpeg virtual file system
      for (let i = 0; i < frames.length; i++) {
        setDownloadStatus({ 
          status: 'processing', 
          message: `Processando frame ${i+1}/${frames.length}...` 
        });
        
        const dataUrl = frames[i].toDataURL('image/png');
        const fileName = `frames/frame_${i.toString().padStart(3, '0')}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(dataUrl));
      }
    
      setDownloadStatus({ status: 'encodingMp4', message: 'Codificando vídeo...' });
      
      // Generate MP4 using FFmpeg
      await ffmpeg.exec([
        '-framerate', '3',
        '-pattern_type', 'glob',
        '-i', 'frames/frame_*.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-shortest',
        'output.mp4'
      ]);
    
      setDownloadStatus({ status: 'downloading', message: 'Preparando download...' });
      
      // Read the output file
      const data = await ffmpeg.readFile('output.mp4');
    
      // Create download link
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'carrossel'}_preview.mp4`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
    
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Erro ao gerar MP4:', error);
      throw new Error(`Falha na geração do MP4: ${error.message}`);
    }
  };

  // Fallback download method (simpler version without animation)
  const handleSimpleDownload = () => {
    if (!carouselRef.current) return;
    
    setIsGeneratingPreview(true);
    setDownloadStatus({ status: 'capturing', message: 'Capturando pré-visualização...' });
    
    try {
      html2canvas(carouselRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      }).then(canvas => {
        setDownloadStatus({ status: 'downloading', message: 'Preparando download...' });
        
        // Convert to PNG and download
        const link = document.createElement('a');
        link.download = `${templateName || 'carrossel'}_preview.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          setDownloadStatus({ status: 'success', message: 'Download concluído!' });
          
          // Reset status after a delay
          setTimeout(() => {
            setDownloadStatus({ status: 'idle', message: '' });
          }, 3000);
        }, 100);
      });
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
              {/* Coluna de Visualização */}
              <div className={styles.previewSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Visualização Final</h3>
                  <p className={styles.previewDescription}>
                    Este é o carrossel que seus clientes verão no WhatsApp. Deslize para ver todos os cartões.
                  </p>
                </div>
                
                <div className={styles.previewContainer} ref={carouselRef}>
                  <CarouselPreview 
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
                </div>
                
                <div className={styles.previewActions}>
                  <div className={styles.downloadOptions}>
                    <h4 className={styles.downloadTitle}>Salvar Visualização</h4>
                    
                    {ffmpegError ? (
                      <div className={styles.ffmpegError}>
                        <FiAlertTriangle className={styles.errorIcon} />
                        <p>Não foi possível carregar a ferramenta de geração de vídeo. Você ainda pode baixar uma imagem estática.</p>
                        <Button 
                          variant="outline" 
                          color="primary"
                          onClick={handleSimpleDownload}
                          loading={isGeneratingPreview}
                          disabled={isGeneratingPreview}
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
                            >
                              <FiFilm className={styles.formatIcon} />
                              Vídeo MP4
                            </button>
                            <button 
                              className={`${styles.formatOption} ${previewFormat === 'gif' ? styles.activeFormat : ''}`}
                              onClick={() => setPreviewFormat('gif')}
                            >
                              <FiImage className={styles.formatIcon} />
                              Animação GIF
                            </button>
                          </div>
                        </div>
                      
                        <Button 
                          variant="outline" 
                          color="primary"
                          onClick={generateAnimatedPreview}
                          loading={isGeneratingPreview}
                          disabled={isGeneratingPreview}
                          iconLeft={<FiDownload />}
                        >
                          {isGeneratingPreview ? 
                            `${downloadStatus.message || 'Processando...'}` : 
                            `Baixar ${previewFormat === 'mp4' ? 'Vídeo' : 'GIF'}`
                          }
                        </Button>
                        
                        {downloadStatus.status === 'error' && (
                          <div className={styles.downloadError}>
                            <FiAlertTriangle className={styles.errorIcon} />
                            <p>{downloadStatus.message}</p>
                            <button 
                              className={styles.fallbackButton}
                              onClick={handleSimpleDownload}
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
                        color="content"
                        onClick={() => handleCopy('sendTemplate')}
                        iconLeft={justCopied.sendTemplate ? <FiCheck /> : <FiCopy />}
                      >
                        {justCopied.sendTemplate ? 'Copiado!' : 'Copiar JSON'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        color="content"
                        onClick={() => handleDownload('sendTemplate')}
                        iconLeft={<FiDownload />}
                      >
                        Baixar JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
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
                      <label className={styles.label}>Número com código do país</label>
                      <div className={styles.phoneInputWrapper}>
                        <span className={styles.phonePrefix}>+</span>
                        <input 
                          type="tel" 
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
                      <span className={styles.inputHelp}>
                        Digite o número completo com código do país (ex: 5521999999999)
                      </span>
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
                    
                    <div className={styles.sendInfoBox}>
                      <FiInfo className={styles.infoIcon} />
                      <p className={styles.infoText}>
                        O número de destino precisa ter iniciado uma conversa com seu WhatsApp Business 
                        nas últimas 24 horas ou estar na sua lista de contatos para receber este template.
                      </p>
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