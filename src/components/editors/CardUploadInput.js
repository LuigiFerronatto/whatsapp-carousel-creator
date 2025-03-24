// React e Hooks
import React, { useState, useRef, useEffect, useCallback } from 'react';

// Hooks personalizados
import { useFileUpload } from '../../hooks/common/useFileUpload';
import { useAlertService } from '../../hooks/common/useAlertService';

// Componentes
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';

// Ícones
import { 
  FiImage, FiVideo, FiUploadCloud, FiLink, 
  FiCheck, FiAlertCircle, FiX, FiExternalLink,
  FiTrendingUp, FiCopy, FiInfo, FiEye, 
  FiRefreshCw, FiTrash2, FiEdit3 
} from 'react-icons/fi';

// Estilos
import styles from './CardUploadInput.module.css';

/**
 * Componente aprimorado para upload ou seleção de URL para cada cartão do carrossel
 * Design refinado e UX simplificada com foco na experiência do usuário
 * Corrigido para lidar corretamente com URLs e uploads de arquivo
 * 
 * @param {Object} props Propriedades do componente
 * @param {number} props.index Índice do cartão
 * @param {Object} props.card Dados do cartão
 * @param {Function} props.updateCard Função para atualizar dados do cartão
 * @param {number} props.totalCards Total de cartões
 * @returns {JSX.Element} Componente CardUploadInput
 */
const CardUploadInput = ({ index, card, updateCard, totalCards }) => {
  // Inicializar sistema de alertas
  const alert = useAlertService();
  
  // Estado local
  const [uploadMethod, setUploadMethod] = useState(card.fileUrl ? 'url' : 'file');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(card.fileUrl || '');
  const [urlValidationError, setUrlValidationError] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [forceRender, setForceRender] = useState(0);

  // Refs
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  const previewImgRef = useRef(null);
  const urlInputRef = useRef(null);
  
  // Hook customizado para upload de arquivos
  const { 
    uploadToAzure, 
    isUploading, 
    uploadError, 
    uploadedFile, 
    resetUpload 
  } = useFileUpload();

  // Atualiza preview quando a URL do cartão muda
  useEffect(() => {
    // Só iniciar carregamento se houver uma URL válida
    if (card.fileUrl) {
      // Resetar estados de erro
      setUrlValidationError('');
      setPreviewError(false);
      
      // Iniciar carregamento apenas se o preview ainda não estiver visível
      if (!previewUrl || previewUrl !== card.fileUrl) {
        setLoadingPreview(true);
        setPreviewUrl(card.fileUrl);
      }
      
      // Para tipo URL, verificar pré-carregamento fora do DOM
      if (card.fileType === 'image') {
        // Criar um objeto de imagem para pré-carregar
        const preloadImg = new Image();
        
        // Definir handlers antes de definir src
        preloadImg.onload = () => {
          // Só atualizar estado se o componente ainda estiver montado e a URL não mudou
          setLoadingPreview(false);
          setPreviewError(false);
        };
        
        preloadImg.onerror = () => {
          // Só atualizar estado se o componente ainda estiver montado e a URL não mudou
          setLoadingPreview(false);
          setPreviewError(true);
          console.error(`Erro ao carregar imagem para Card ${index + 1}: ${card.fileUrl}`);
          
          // Feedback visual sobre o erro
          alert.warning(`Não foi possível carregar a imagem do Card ${index + 1}. Verifique se a URL está correta.`, {
            position: 'bottom-right',
            autoCloseTime: 4000
          });
        };
        
        // Iniciar carregamento
        preloadImg.src = card.fileUrl;
      }
      // Vídeos serão tratados pelos eventos onLoadedData/onError no componente de vídeo
    } else {
      // Se não há URL, limpar o preview
      setPreviewUrl('');
      setLoadingPreview(false);
      setPreviewError(false);
    }
  }, [card.fileUrl, card.fileType, index, alert]);

  // Monitora drag & drop para melhorar UX
  useEffect(() => {
    const handleGlobalDragEnter = (e) => {
      // Se o usuário está arrastando arquivos e o método atual não é 'file'
      if (e.dataTransfer.types.includes('Files') && uploadMethod !== 'file') {
        // Mude automaticamente para o método de arquivo
        setUploadMethod('file');
        // Mostre um toast informativo
        alert.info(`Modo de upload de arquivo ativado para o Card ${index + 1}`, {
          position: 'bottom-right',
          autoCloseTime: 2000
        });
      }
    };
    
    document.addEventListener('dragenter', handleGlobalDragEnter);
    
    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter);
    };
  }, [uploadMethod, index, alert]);

  // Manipuladores de arrastar e soltar aprimorados
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Feedback visual na área de drop
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add(styles.activeDrop);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Remover feedback visual
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove(styles.activeDrop);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Remover feedback visual
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove(styles.activeDrop);
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  }, []);

  // Validação de tipo de arquivo
  const validateFileType = useCallback((file) => {
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const acceptedVideoTypes = ['video/mp4', 'video/webm'];
    
    const isAcceptedType = [...acceptedImageTypes, ...acceptedVideoTypes].includes(file.type);
    
    if (!isAcceptedType) {
      alert.error("FILE_TYPE_ERROR", {
        position: 'top-center',
        autoCloseTime: 5000
      }, file.type);
      return false;
    }
    
    // Verificar tamanho (limite de 10MB para imagens, 30MB para vídeos)
    const isImage = acceptedImageTypes.includes(file.type);
    const maxSize = isImage ? 10 * 1024 * 1024 : 30 * 1024 * 1024;
    
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const limit = isImage ? '10MB' : '30MB';
      alert.error("FILE_SIZE_ERROR", {
        position: 'top-center',
        autoCloseTime: 5000
      }, sizeInMB + "MB", limit);
      return false;
    }
    
    return true;
  }, [alert]);

  // Manipulador de upload de arquivo com feedback visual e controle de progresso
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar o tipo de arquivo antes de iniciar upload
    if (!validateFileType(file)) {
      // Limpar input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
  
    try {
      // Determina o tipo de arquivo (imagem ou vídeo)
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      updateCard(index, 'fileType', fileType);
      
      // Cria preview local temporário
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      setLoadingPreview(true);
      setPreviewError(false);
      
      // Função para atualizar o progresso
      const updateProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      // Mostrar feedback visual de carregamento
      dropAreaRef.current?.classList.add(styles.uploading);
      
      // Mostrar alerta de progresso
      const progressToastId = `upload-progress-${index}-${Date.now()}`;
      setTimeout(() => {
        alert.info("UPLOAD_STARTED", {
          id: progressToastId,
          position: 'bottom-right',
          autoCloseTime: false,
          progress: 0
        });
      }, 0);
      
      // Upload do arquivo
      const uploadResult = await uploadToAzure(file, updateProgress);
    
      if (!uploadResult || !uploadResult.url) {
        throw new Error("Upload falhou: nenhuma URL retornada.");
      }
    
      console.log("Upload concluído!", uploadResult);
    
      // Formatar filename mais amigável para exibição
      const displayName = file.name.length > 20 
        ? file.name.substring(0, 18) + '...' + file.name.slice(-8)
        : file.name;
      
      // Atualiza o card com URL e metadados - URL manipulada da mesma forma para uploads e URLs
      updateCard(index, 'fileUrl', uploadResult.url);
      updateCard(index, 'fileType', fileType);
      updateCard(index, 'fileName', displayName);
      updateCard(index, 'fileSize', file.size);
      updateCard(index, 'uploadDate', new Date().toISOString());
      updateCard(index, 'hasFile', true);
      updateCard(index, 'uploadMethod', 'file'); // Marcar como upload de arquivo
      
      // CORREÇÃO: Adicionar pequeno atraso para garantir que o estado seja atualizado
      setTimeout(() => {
        // Garantir que a URL seja tratada como uma URL externa normal após o upload
        // Isso garante que o tratamento seja consistente entre URLs de upload e manuais
        setPreviewUrl(''); // Limpar primeiro
        setTimeout(() => {
          setPreviewUrl(uploadResult.url); // Definir novamente para forçar re-renderização
          setLoadingPreview(false); // Importante: definir como falso após URL ser aplicada
          setPreviewError(false);
        }, 50);
      }, 100);
      
      // Alerta de sucesso com animação
      alert.success("UPLOAD_SUCCESS", {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      
      // Adicionar classe para animação de sucesso
      dropAreaRef.current?.classList.add(styles.uploadSuccess);
      setTimeout(() => {
        dropAreaRef.current?.classList.remove(styles.uploadSuccess);
      }, 1000);
      
      // Salvar o rascunho após o upload
      if (typeof window.saveCurrentDraft === 'function') {
        window.saveCurrentDraft();
      }
    } catch (error) {
      console.error('Erro no processamento do arquivo:', error);
      
      // Adicionar classe para animação de erro
      dropAreaRef.current?.classList.add(styles.uploadError);
      setTimeout(() => {
        dropAreaRef.current?.classList.remove(styles.uploadError);
      }, 1000);
      
      alert.error("UPLOAD_ERROR", {
        position: 'top-center',
        autoCloseTime: 5000
      }, error.message || 'Erro desconhecido');
      
      setPreviewError(true);
    } finally {
      // Limpa input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // CORREÇÃO: Não desativa o loading aqui, será tratado após o timeout
      // para garantir que a imagem apareça
      
      // Remover classe de upload
      dropAreaRef.current?.classList.remove(styles.uploading);
      setUploadProgress(0);
    }
  }, [index, updateCard, uploadToAzure, alert, validateFileType]);

  // Abre seletor de arquivos
  const handleFileInputClick = useCallback(() => {
    resetUpload();
    fileInputRef.current?.click();
  }, [resetUpload]);

  // Validação de URL aprimorada com detecção de tipo
  const validateUrl = useCallback((url) => {
    if (!url) {
      setUrlValidationError('URL é obrigatória');
      return false;
    }
    
    try {
      new URL(url);
      
      // Validar se a URL termina com uma extensão de imagem/vídeo conhecida
      const fileExtension = url.split('.').pop().toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
      
      const isImage = imageExtensions.includes(fileExtension);
      const isVideo = videoExtensions.includes(fileExtension);
      
      // Se conseguirmos detectar o tipo, atualizar automaticamente
      if (isImage) {
        updateCard(index, 'fileType', 'image');
      } else if (isVideo) {
        updateCard(index, 'fileType', 'video');
      }
      
      setUrlValidationError('');
      return true;
    } catch (e) {
      setUrlValidationError('URL inválida. Inclua "https://" ou "http://"');
      return false;
    }
  }, [index, updateCard]);

  // Manipulador de mudança de URL - CORRIGIDO para não enviar URLs para o Azure
  const handleUrlChange = useCallback((e) => {
    const url = e.target.value.trim();
    
    if (!url) {
      updateCard(index, 'fileUrl', '');
      updateCard(index, 'hasFile', false);
      setUrlValidationError('');
      setPreviewUrl('');
      return;
    }
    
    // Validar a URL antes de aplicar
    if (validateUrl(url)) {
      // Mostrar feedback de carregamento
      setLoadingPreview(true);
      setPreviewError(false);
      
      // Atualizar card com a URL diretamente (sem enviar para Azure)
      updateCard(index, 'fileUrl', url);
      updateCard(index, 'uploadMethod', 'url'); // Marcar como URL externa
      updateCard(index, 'hasFile', true);
      
      // Definir data/hora de "upload" (na verdade, quando a URL foi adicionada)
      updateCard(index, 'uploadDate', new Date().toISOString());
      
      // Para URLs, não temos tamanho do arquivo, mas podemos definir um nome descritivo
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      updateCard(index, 'fileName', fileName || `url-${index + 1}`);
      
      // Atualizar preview
      setPreviewUrl(url);
      
      // Mostrar alerta de sucesso
      alert.success(`URL configurada para o Card ${index + 1}!`, {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      
      // Salvar o rascunho após a alteração
      if (typeof window.saveCurrentDraft === 'function') {
        window.saveCurrentDraft();
      }
    }
  }, [index, updateCard, validateUrl, alert]);

  // Aplicar URL quando o usuário pressionar Enter
  const handleUrlKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleUrlChange(e);
    }
  }, [handleUrlChange]);

  // Usa URL de teste
  const handleTestUrlClick = useCallback(() => {
    // Mostra alerta de carregamento
    const loadingToastId = `loading-test-url-${index}`;
    alert.info(`Carregando URL de teste para o Card ${index + 1}...`, {
      id: loadingToastId,
      position: 'bottom-right',
      autoCloseTime: false,
    });
    
    // Array com URLs de teste
    const testUrls = [
      "https://images.sympla.com.br/64999ce2a7792.png"
    ];
    
    // Seleciona uma URL baseada no índice do card (para consistência)
    const newUrl = testUrls[index % testUrls.length];
    
    // Simular um pequeno atraso para uma experiência mais realista
    setTimeout(() => {
      updateCard(index, 'fileUrl', newUrl);
      updateCard(index, 'fileType', 'image');
      updateCard(index, 'fileName', `imagem-teste-${index + 1}.png`);
      updateCard(index, 'uploadMethod', 'url'); // Marcar como URL
      updateCard(index, 'fileSize', 124500);
      updateCard(index, 'uploadDate', new Date().toISOString());
      updateCard(index, 'hasFile', true);
      
      setUploadMethod('url'); // Mudar para método URL
      validateUrl(newUrl);
      setPreviewUrl(newUrl);
      
      // Mostrar alerta de sucesso
      setTimeout(() => {
        alert.success(`URL de teste aplicada ao Card ${index + 1}`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }, 0);
      
      // Salvar o rascunho após a alteração
      if (typeof window.saveCurrentDraft === 'function') {
        window.saveCurrentDraft();
      }
    }, 800); // Pequeno atraso para feedback visual
  }, [index, updateCard, validateUrl, alert]);

  // Limpa arquivo/URL com confirmação simplificada
  const handleClearFile = useCallback(() => {
    // Sem verificação de bloqueio, conforme solicitado
    if (card.fileUrl && !window.confirm(`Tem certeza que deseja remover o arquivo do Card ${index + 1}?`)) {
      return;
    }
    
    // Animação de limpeza
    const previewSection = document.querySelector(`#preview-section-${index}`);
    if (previewSection) {
      previewSection.classList.add(styles.clearingAnimation);
    }
    
    // Pequeno atraso para a animação ser visível
    setTimeout(() => {
      // Limpar a URL e arquivo
      updateCard(index, 'fileUrl', '');
      updateCard(index, 'fileName', '');
      updateCard(index, 'fileSize', null);
      updateCard(index, 'hasFile', false);
      updateCard(index, 'uploadMethod', ''); // Limpar método de upload
      
      // Limpar o preview
      setPreviewUrl('');
      
      // Resetar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Resetar o input de URL
      if (urlInputRef.current) {
        urlInputRef.current.value = '';
      }
      
      // Resetar quaisquer erros
      setUrlValidationError('');
      setPreviewError(false);
      resetUpload && resetUpload();
      
      // Mostrar alerta de informação
      setTimeout(() => {
        alert.info(`Card ${index + 1} foi limpo`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }, 0);
      
      // Salvar o rascunho após a alteração
      if (typeof window.saveCurrentDraft === 'function') {
        window.saveCurrentDraft();
      }
      
      // Remover classe de animação
      if (previewSection) {
        previewSection.classList.remove(styles.clearingAnimation);
      }
    }, 300);
  }, [index, updateCard, resetUpload, card.fileUrl, alert]);

  // Muda tipo de arquivo com feedback visual
  const handleFileTypeChange = useCallback((e) => {
    const newType = e.target.value;
    
    // Verificar se o tipo é compatível com a extensão do arquivo se tivermos fileName
    if (card.fileName) {
      const extension = card.fileName.split('.').pop().toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
      
      if (newType === 'image' && videoExtensions.includes(extension)) {
        alert.warning(`A extensão .${extension} geralmente é um formato de vídeo.`, {
          position: 'bottom-right',
          autoCloseTime: 4000
        });
      } else if (newType === 'video' && imageExtensions.includes(extension)) {
        alert.warning(`A extensão .${extension} geralmente é um formato de imagem.`, {
          position: 'bottom-right',
          autoCloseTime: 4000
        });
      }
    }
    
    updateCard(index, 'fileType', newType);
    
    // Feedback visual sobre a alteração
    setTimeout(() => {
      alert.info(`Tipo de arquivo alterado para ${newType === 'image' ? 'imagem' : 'vídeo'} no Card ${index + 1}`, {
        position: 'bottom-right',
        autoCloseTime: 2000
      });
    }, 0);
  }, [index, updateCard, alert, card.fileName]);

  // Verificar URL para melhorar feedback ao usuário
  const checkUrl = useCallback(() => {
    if (!card.fileUrl) return;
    
    // Mostrar alerta de verificação
    const checkingToastId = `checking-url-${index}`;
    alert.info(`Verificando URL para o Card ${index + 1}...`, {
      id: checkingToastId,
      position: 'bottom-right',
      autoCloseTime: false
    });
    
    // Criar um objeto Image para verificar se a URL carrega
    const img = new Image();
    img.onload = () => {
      // URL funciona para imagem
      alert.success(`URL verificada com sucesso para o Card ${index + 1}!`, {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      setPreviewError(false);
    };
    
    img.onerror = () => {
      // Falha ao carregar imagem, verificar se é vídeo
      const video = document.createElement('video');
      
      video.onloadeddata = () => {
        // URL funciona para vídeo
        alert.success(`URL de vídeo verificada com sucesso para o Card ${index + 1}!`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
        setPreviewError(false);
        
        // Atualizar o tipo para vídeo se o usuário tinha selecionado imagem
        if (card.fileType !== 'video') {
          updateCard(index, 'fileType', 'video');
          alert.info(`Tipo de arquivo atualizado para vídeo no Card ${index + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 3000
          });
        }
      };
      
      video.onerror = () => {
        // URL não funciona para imagem nem vídeo
        alert.error(`A URL fornecida no Card ${index + 1} não parece ser válida. Verifique se o endereço está correto.`, {
          position: 'bottom-right',
          autoCloseTime: 5000
        });
        setPreviewError(true);
      };
      
      video.src = card.fileUrl;
    };
    
    img.src = card.fileUrl;
  }, [card.fileUrl, card.fileType, index, alert, updateCard]);

  const videoRef = useRef(null);

const handleVideoLoad = useCallback(() => {
  setLoadingPreview(false);
  setPreviewError(false);
  
  // Adicionar classe de sucesso temporária para feedback visual
  const videoElement = videoRef.current;
  if (videoElement) {
    videoElement.classList.add(styles.loadSuccess);
    setTimeout(() => {
      if (videoElement) {
        videoElement.classList.remove(styles.loadSuccess);
      }
    }, 500);
  }
  
  // Log para depuração
  console.log(`Vídeo carregado com sucesso para o Card ${index + 1}`);
}, [index]);

  // Obtém ícone do tipo de arquivo
  const getFileTypeIcon = useCallback(() => {
    return card.fileType === 'image' ? 
      <FiImage size={20} className={styles.typeIcon} /> : 
      <FiVideo size={20} className={styles.typeIcon} />;
  }, [card.fileType]);

  // Atualização do status da imagem de preview
  const handlePreviewLoad = useCallback(() => {
    console.log(`Imagem/vídeo carregado com sucesso para Card ${index + 1}`);
    
    // CORREÇÃO: Definir estados de carregamento independentemente do método
    setLoadingPreview(false);
    setPreviewError(false);
    
    // Adicionar feedback visual de sucesso
    const element = card.fileType === 'image' ? previewImgRef.current : videoRef.current;
    if (element) {
      element.classList.add(styles.loadSuccess);
      setTimeout(() => {
        if (element) {
          element.classList.remove(styles.loadSuccess);
        }
      }, 500);
    }
  }, [index, card.fileType]);

  const handlePreviewError = useCallback(() => {
    setLoadingPreview(false);
    setPreviewError(true);
    
    // Mostrar alerta sobre erro de carregamento
    alert.warning(`Não foi possível carregar a prévia para o Card ${index + 1}. Verifique se a URL é válida.`, {
      position: 'bottom-right',
      autoCloseTime: 4000
    });
  }, [index, alert]);

  // Classe CSS do cartão baseada no índice e status
  const cardClass = `${styles.cardContainer} ${index % 2 === 0 ? styles.evenCard : styles.oddCard} ${card.fileUrl ? styles.hasContent : ''}`;

  // Quando o componente montar, verifique se já existe uma URL e defina o método de upload correto
  useEffect(() => {
    if (card.fileUrl) {
      // Se foi marcado como upload ou se tem fileSize, consideramos como um arquivo carregado
      // caso contrário, consideramos como uma URL externa
      setUploadMethod(card.uploadMethod === 'file' || card.fileSize ? 'file' : 'url');
    }
  }, [card.fileUrl, card.uploadMethod, card.fileSize]);

  return (
    <div className={cardClass}>
      {/* Progresso de upload animado */}
      {uploadProgress > 0 && (
        <div className={`${styles.progressIndicator} ${styles.active}`}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      <div className={styles.cardHeader}>
        <div className={styles.cardNumberWrapper}>
          <div className={styles.cardNumber}>
            Cartão {index + 1}
          </div>
        </div>

        <div className={styles.fileTypeSelect}>
          <select 
            className={styles.select}
            value={card.fileType || 'image'}
            onChange={handleFileTypeChange}
            aria-label="Tipo de mídia"
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
          <div className={styles.fileTypeIconWrapper}>
            {getFileTypeIcon()}
          </div>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.uploadMethods}>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'url' ? styles.activeMethod : ''}`}
            onClick={() => setUploadMethod('url')}
            aria-label="Mudar para método URL"
          >
            <FiLink size={16} />
            <span>URL</span>
          </button>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'file' ? styles.activeMethod : ''}`}
            onClick={() => setUploadMethod('file')}
            aria-label="Mudar para método Upload"
          >
            <FiUploadCloud size={16} />
            <span>Upload</span>
          </button>
        </div>

        {!previewUrl ? (
          uploadMethod === 'url' ? (
            <div className={styles.formGroup}>
              <div className={styles.uploadHeader}>
                <label className={styles.label}>URL do Arquivo</label>
              </div>
              
              <Input
                type="url"
                clearable
                ref={urlInputRef}
                value={card.fileUrl || ''}
                onChange={(e) => validateUrl(e.target.value)} // Validar ao digitar
                onBlur={handleUrlChange} // Aplicar ao sair do campo
                onKeyDown={handleUrlKeyDown} // Aplicar ao pressionar Enter
                onClear={handleClearFile}
                placeholder="https://exemplo.com/imagem.jpg"
                error={urlValidationError}
                aria-label="URL do arquivo de mídia"
              />
              
              <div className={styles.urlHelpActions}>
                <span className={styles.urlHint}>Cole uma URL direta para uma imagem ou vídeo</span>
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={handleTestUrlClick}
                  iconLeft={<FiTrendingUp size={14} />}
                >
                  Usar URL de teste
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <div className={styles.uploadHeader}>
                <label className={styles.label}>{previewUrl ? 'Visualização do Arquivo' : 'Upload de Arquivo'}</label>
              </div>
              
              <div 
                className={`${styles.dropArea} ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                ref={dropAreaRef}
                onClick={handleFileInputClick}
                role="button"
                tabIndex={0}
                aria-label="Área de arrastar e soltar"
              >
                {isUploading ? (
                  <>
                    <div className={styles.uploadingSpinner}></div>
                    <p className={styles.dropText}>Enviando arquivo...</p>
                    <p className={styles.dropHint}>
                      {uploadProgress > 0 ? `${Math.round(uploadProgress)}% concluído` : 'Preparando upload...'}
                    </p>
                  </>
                ) : (
                  <>
                    <FiUploadCloud size={32} className={styles.uploadIcon} />
                    <p className={styles.dropText}>
                      Arraste um arquivo ou clique para escolher
                    </p>
                    <div className={styles.dropHintEnhanced}>
                      <div className={styles.formatBadges}>
                        <span className={styles.formatBadge}>JPEG</span>
                        <span className={styles.formatBadge}>PNG</span>
                        <span className={styles.formatBadge}>MP4</span>
                      </div>
                      <span className={styles.sizeLimit}>
                        Limite: {card.fileType === 'image' ? '10MB' : '30MB'}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isUploading}
                aria-hidden="true"
              />
            </div>
          )
        ) : (
          <div className={styles.formGroup}>
            <div className={styles.uploadHeader}>
              <label className={styles.label}>Visualização do Arquivo</label>
            </div>
            <div 
              className={`${styles.dropArea} ${styles.previewContent} ${loadingPreview ? styles.loading : ''} ${previewError ? styles.error : ''}`}
              id={`preview-section-${index}`}>
              {loadingPreview && (
                <div className={styles.previewLoader}>
                  <div className={styles.spinner}></div>
                  <p>Carregando...</p>
                </div>
              )}
              
              {previewError && (
                <div className={styles.previewErrorMessage}>
                  <FiAlertCircle size={32} />
                  <p>Não foi possível carregar a mídia</p>
                  <Button
                    variant="outline"
                    size="small"
                    color="secondary"
                    onClick={() => {
                      setPreviewError(false);
                      setLoadingPreview(true);
                      const imgEl = previewImgRef.current;
                      if (imgEl) {
                        imgEl.src = card.fileUrl + '?t=' + Date.now();
                      }
                    }}
                    iconLeft={<FiRefreshCw size={14} />}
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}
              
              {/* Botão de remover estilizado no canto superior direito */}
              <button
                className={styles.removeMediaButton}
                onClick={handleClearFile}
                aria-label="Remover mídia"
                title="Remover mídia"
              >
                <FiX size={18} />
              </button>
              
              {card.fileType === 'image' ? (
  // Renderização de imagem com tratamento correto de carregamento
<img 
  ref={previewImgRef}
  src={previewUrl} 
  alt={`Pré-visualização do Cartão ${index + 1}`} 
  className={`${styles.previewImage} ${previewError ? styles.hidden : ''}`}
  loading="lazy"
  onLoad={handlePreviewLoad}
  onError={handlePreviewError}
  style={{ 
    opacity: loadingPreview ? 0 : 1,
    transition: 'opacity 0.3s ease'
  }}
/>
) : (
  // Renderização de vídeo com tratamento correto de carregamento
  <div className={styles.videoWrapper}>
    <video 
  ref={videoRef}
  src={previewUrl} 
  className={`${styles.previewVideo} ${previewError ? styles.hidden : ''}`}
  controls
  playsInline
  preload="metadata"
  onLoadedData={handlePreviewLoad}
  onError={handlePreviewError}
  style={{ 
    opacity: loadingPreview ? 0 : 1,
    transition: 'opacity 0.3s ease'
  }}
  poster="/static/video-poster.jpg"
/>
    {!previewError && !loadingPreview && (
      <div className={styles.videoOverlay}>
        <div className={styles.videoFormatInfo}>
          <span>MP4, WebM</span>
        </div>
      </div>
    )}
  </div>
)}
            </div>
          </div>
        )}

        {uploadError && (
          <div className={styles.errorMessageContainer}>
            <div className={styles.errorMessage}>
              <FiAlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
            <Button
              variant="text"
              size="small"
              color="negative"
              onClick={resetUpload}
              iconLeft={<FiRefreshCw size={14} />}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className={styles.formGroup}>
          <div className={styles.previewActions}>
            <div className={styles.previewActionGroup}>
              <Button 
                variant="text"
                size="small"
                color="primary"
                as="a"
                href={card.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                iconLeft={<FiExternalLink size={14} />}
                title="Abrir a mídia em uma nova aba"
              >
                Ver original
              </Button>
              
              <Button
                variant="text"
                size="small"
                color="negative"
                onClick={handleClearFile}
                iconLeft={<FiTrash2 size={14} />}
                title="Remover mídia"
              >
                Remover
              </Button>
            </div>
            
            {card.uploadDate && (
              <div className={styles.mediaDetailsFooter}>
                <div className={styles.uploadDetails}>
                  <span className={styles.uploadTimestamp}>
                    {`${card.fileName || 'Arquivo'} • `}
                    {`${((card.fileSize || 0) / 1024).toFixed(1)} KB`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Utilizar React.memo para otimizar performance e evitar renderizações desnecessárias
export default React.memo(CardUploadInput);