// components/editors/CardUploadInput.js - Versão corrigida
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useAlert } from '../ui/AlertMessage/AlertContext';
import Button from '../ui/Button/Button';
import { 
  FiImage, 
  FiVideo, 
  FiUploadCloud, 
  FiLink, 
  FiCheck, 
  FiAlertCircle, 
  FiX,
  FiExternalLink,
  FiTrendingUp,
  FiCopy,
  FiLock,
  FiUnlock
} from 'react-icons/fi';
import styles from './CardUploadInput.module.css';
import Input from '../ui/Input/Input';

/**
 * Componente aprimorado para upload ou seleção de URL para cada cartão do carrossel
 * Corrigido para exibir corretamente os fileHandles e garantir funcionalidade de upload
 * Adicionado sistema de bloqueio para proteger arquivos já enviados
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
  const alert = useAlert();
  
  // Estado local
  const [uploadMethod, setUploadMethod] = useState(card.fileUrl ? 'url' : 'file');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(card.fileUrl || '');
  const [urlValidationError, setUrlValidationError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(!!card.fileHandle);
  
  // Refs
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
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
    if (card.fileUrl) {
      setPreviewUrl(card.fileUrl);
      setUrlValidationError('');
    } else {
      setPreviewUrl('');
    }
  }, [card.fileUrl]);

  // Atualiza status de bloqueio quando fileHandle muda
  useEffect(() => {
    setIsLocked(!!card.fileHandle);
  }, [card.fileHandle]);

  // Alterna o estado de bloqueio do card
  const toggleLock = useCallback(() => {
    if (!card.fileHandle) {
      // Não pode bloquear um card sem fileHandle
      alert.warning(`O Card ${index + 1} precisa ter um arquivo válido para ser bloqueado`, {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      return;
    }
    
    setIsLocked(prev => !prev);
    
    // Mostrar alerta apropriado
    setTimeout(() => {
      if (isLocked) {
        alert.info(`Card ${index + 1} desbloqueado. Agora você pode modificar o arquivo.`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      } else {
        alert.success(`Card ${index + 1} bloqueado. O arquivo está protegido contra alterações.`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [card.fileHandle, isLocked, index, alert]);

  // Manipuladores de arrastar e soltar
  const handleDragEnter = useCallback((e) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, [isLocked]);

  const handleDragLeave = useCallback((e) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, [isLocked]);

  const handleDragOver = useCallback((e) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging, isLocked]);

  const handleDrop = useCallback((e) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  }, [isLocked]);

  // Manipulador de upload de arquivo - Corrigido
  const handleFileUpload = useCallback(async (event) => {
    // Se o card estiver bloqueado, impedir upload
    if (isLocked) {
      setTimeout(() => {
        alert.warning(`Card ${index + 1} está bloqueado. Desbloqueie para alterar o arquivo.`, {
          position: 'top-center',
          autoCloseTime: 3000
        });
      }, 0);
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Determina o tipo de arquivo (imagem ou vídeo)
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      updateCard(index, 'fileType', fileType);
      
      // Cria preview local temporário
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      
      // Usar try/catch para lidar com falhas de upload graciosamente
      let uploadResult;
      try {
        // Mostrar alerta de progresso
        setTimeout(() => {
          alert.info(`Enviando ${fileType === 'image' ? 'imagem' : 'vídeo'} para o Card ${index + 1}...`, {
            position: 'bottom-right',
            autoCloseTime: 3000
          });
        }, 0);
        
        // Tentar upload
        uploadResult = await uploadToAzure(file);
      } catch (uploadError) {
        console.error('Upload falhou, usando fallback:', uploadError);
        
        // Criar resultado de fallback usando URL temporária
        uploadResult = {
          url: tempUrl,
          type: fileType,
          name: `fallback-${Date.now()}`
        };
        
        setTimeout(() => {
          alert.warning(`Usando preview local para o Card ${index + 1} devido a problemas de upload`, {
            position: 'bottom-right',
            autoCloseTime: 4000
          });
        }, 0);
      }
      
      // Atualizar card com URL e fileHandle
      updateCard(index, 'fileUrl', uploadResult.url || tempUrl);
      updateCard(index, 'fileType', uploadResult.type || fileType);
      updateCard(index, 'fileHandle', uploadResult.name || `file-${Date.now()}`);
      
      // Auto-bloquear o card após upload bem-sucedido
      setIsLocked(true);
      
      // Alerta de sucesso
      setTimeout(() => {
        alert.success(`Arquivo configurado para o Card ${index + 1}!`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }, 0);
      
      // Salvar o rascunho após o upload
      if (typeof window.saveCurrentDraft === 'function') {
        window.saveCurrentDraft();
      }
    } catch (error) {
      console.error('Erro no processamento do arquivo:', error);
      
      setTimeout(() => {
        alert.error(`Erro no upload: ${error.message || 'Erro desconhecido'}`, {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }, 0);
    } finally {
      // Limpa input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [index, updateCard, uploadToAzure, alert, isLocked]);

  // Abre seletor de arquivos
  const handleFileInputClick = useCallback(() => {
    if (isLocked) {
      setTimeout(() => {
        alert.warning(`Card ${index + 1} está bloqueado. Desbloqueie para alterar o arquivo.`, {
          position: 'top-center',
          autoCloseTime: 3000
        });
      }, 0);
      return;
    }
    
    resetUpload();
    fileInputRef.current?.click();
  }, [resetUpload, isLocked, index, alert]);

  // Validação de URL
  const validateUrl = useCallback((url) => {
    if (!url) {
      setUrlValidationError('URL é obrigatória');
      return false;
    }
    
    try {
      new URL(url);
      setUrlValidationError('');
      return true;
    } catch (e) {
      setUrlValidationError('URL inválida. Inclua "https://" ou "http://"');
      return false;
    }
  }, []);

  // Manipulador de mudança de URL - Corrigido
  const handleUrlChange = useCallback((e) => {
    if (isLocked) {
      setTimeout(() => {
        alert.warning(`Card ${index + 1} está bloqueado. Desbloqueie para alterar a URL.`, {
          position: 'top-center',
          autoCloseTime: 3000
        });
      }, 0);
      return;
    }
    
    const url = e.target.value;
    updateCard(index, 'fileUrl', url);
    validateUrl(url);
    setUploadMethod('url');
  }, [index, updateCard, validateUrl, isLocked, alert]);
  
  // Copiar fileHandle para a área de transferência
  const copyFileHandle = useCallback(() => {
    if (card.fileHandle) {
      navigator.clipboard.writeText(card.fileHandle)
        .then(() => {
          setCopySuccess(true);
          
          // Mostrar alerta de sucesso
          setTimeout(() => {
            alert.success(`FileHandle do Card ${index + 1} copiado!`, {
              position: 'bottom-right',
              autoCloseTime: 2000
            });
          }, 0);
          
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Erro ao copiar:', err);
          
          // Mostrar alerta de erro
          setTimeout(() => {
            alert.error('Falha ao copiar o FileHandle', {
              position: 'bottom-right',
              autoCloseTime: 3000
            });
          }, 0);
        });
    }
  }, [card.fileHandle, index, alert]);

  // Usa URL de teste
  const handleTestUrlClick = useCallback(() => {
    if (isLocked) {
      setTimeout(() => {
        alert.warning(`Card ${index + 1} está bloqueado. Desbloqueie para usar URL de teste.`, {
          position: 'top-center',
          autoCloseTime: 3000
        });
      }, 0);
      return;
    }
    
    const testUrls = [
      "https://images.sympla.com.br/64999ce2a7792.png"
    ];
        
    const newUrl = testUrls[index % testUrls.length];
    updateCard(index, 'fileUrl', newUrl);
    updateCard(index, 'fileType', 'image');
    
    // Gerar um fileHandle único baseado na URL
    const fileHandle = `4::aW1hZ2UvcG5n:ARZVIx22CJrySgCV1z6a-rpH59lh48wBU0WF9nb69JFl--hu-GopMfp3KCBj6pSk-pMHDY_HYymIt5H7_YE1LfP4cJkgno53JFuUMZj5FePxcQ:e:${Date.now()}:${Math.floor(Math.random() * 999999999)}:${Math.floor(Math.random() * 999999999)}:ARblBi-NqQpu5YdU080`;
    updateCard(index, 'fileHandle', fileHandle);
    
    setUploadMethod('url');
    validateUrl(newUrl);
    
    // Auto-bloquear o card após aplicar URL de teste
    setIsLocked(true);
    
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
  }, [index, updateCard, validateUrl, alert, isLocked]);

  // Limpa URL - Corrigido
  const handleClearUrl = useCallback(() => {
    if (isLocked) {
      const willUnlock = window.confirm(`O Card ${index + 1} está bloqueado. Deseja desbloqueá-lo e limpar?`);
      if (!willUnlock) return;
      setIsLocked(false);
    } else if (card.fileUrl && !window.confirm(`Tem certeza que deseja limpar a URL e o fileHandle do Card ${index + 1}?`)) {
      return;
    }
    
    // Limpar a URL e fileHandle
    updateCard(index, 'fileUrl', '');
    updateCard(index, 'fileHandle', '');
    
    // Limpar o preview
    setPreviewUrl('');
    
    // Resetar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Resetar quaisquer erros
    setUrlValidationError('');
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
  }, [index, updateCard, resetUpload, card.fileUrl, alert, isLocked]);

  // Muda tipo de arquivo
  const handleFileTypeChange = useCallback((e) => {
    if (isLocked) {
      setTimeout(() => {
        alert.warning(`Card ${index + 1} está bloqueado. Desbloqueie para alterar o tipo de arquivo.`, {
          position: 'top-center',
          autoCloseTime: 3000
        });
      }, 0);
      return;
    }
    
    updateCard(index, 'fileType', e.target.value);
  }, [index, updateCard, isLocked, alert]);

  // Obtém ícone do tipo de arquivo
  const getFileTypeIcon = useCallback(() => {
    return card.fileType === 'image' ? 
      <FiImage size={20} className={styles.typeIcon} /> : 
      <FiVideo size={20} className={styles.typeIcon} />;
  }, [card.fileType]);

  // Classe CSS do cartão baseada no índice
  const cardClass = `${styles.cardContainer} ${index % 2 === 0 ? styles.evenCard : styles.oddCard} ${isLocked ? styles.lockedCard : ''}`;

  return (
    <div className={cardClass}>
      <div className={styles.cardHeader}>
        <div className={styles.cardNumber}>
          Cartão {index + 1}
          {isLocked && <FiLock size={14} className={styles.cardLockIcon} />}
        </div>
        
        {card.fileHandle && (
          <div className={styles.fileHandleIndicator}>
            <FiCheck size={14} className={styles.fileHandleIcon} />
            <span>
              FileHandle: {card.fileHandle.length > 15 
                ? card.fileHandle.substring(0, 15) + '...' 
                : card.fileHandle
              }
            </span>
            <Button
              variant="icon"
              size="small"
              color="primary"
              onClick={copyFileHandle}
              title="Copiar FileHandle"
              iconLeft={<FiCopy size={14} />}
            />
            
            {/* Botão de alternar bloqueio */}
            <Button
              variant="icon"
              size="small"
              color={isLocked ? "warning" : "secondary"}
              onClick={toggleLock}
              title={isLocked ? "Desbloquear card" : "Bloquear card"}
              iconLeft={isLocked ? <FiLock size={14} /> : <FiUnlock size={14} />}
            />
          </div>
        )}
        
        <div className={styles.fileTypeSelect}>
          <select 
            className={styles.select}
            value={card.fileType || 'image'}
            onChange={handleFileTypeChange}
            aria-label="Tipo de mídia"
            disabled={isLocked}
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
          </select>
          <div className={styles.fileTypeIconWrapper}>
            {getFileTypeIcon()}
            {isLocked && (
              <div className={styles.lockIndicator}>
                <FiLock size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.uploadMethods}>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'url' ? styles.activeMethod : ''}`}
            onClick={() => !isLocked && setUploadMethod('url')}
            disabled={isLocked}
          >
            <FiLink size={16} />
            <span>URL</span>
          </button>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'file' ? styles.activeMethod : ''}`}
            onClick={() => !isLocked && setUploadMethod('file')}
            disabled={isLocked}
          >
            <FiUploadCloud size={16} />
            <span>Upload</span>
          </button>
        </div>
        
        {uploadMethod === 'url' ? (
          <div className={styles.formGroup}>
            <Input
              label="URL do Arquivo"
              type="url"
              clearable
              value={card.fileUrl || ''}
              onChange={handleUrlChange}
              onClear={handleClearUrl}
              placeholder="https://exemplo.com/imagem.jpg"
              rightElement={
                <div className={styles.urlActions}>
                  <Button
                    variant="text"
                    size="small"
                    color="primary"
                    onClick={handleTestUrlClick}
                    iconLeft={<FiTrendingUp size={14} />}
                    disabled={isLocked}
                  >
                    Testar URL
                  </Button>
                </div>
              }
              error={urlValidationError}
              hintMessage="URL pública da imagem ou vídeo para exibir no carrossel"
              disabled={isLocked}
            />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label className={styles.label}>Upload de Arquivo</label>
            <div 
              className={`${styles.dropArea} ${isDragging ? styles.dragging : ''} ${isLocked ? styles.lockedDropArea : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              ref={dropAreaRef}
              onClick={handleFileInputClick}
              role="button"
              tabIndex={isLocked ? -1 : 0}
              aria-label={isLocked ? "Área de upload bloqueada" : "Área de arrastar e soltar"}
            >
              {isLocked ? (
                <>
                  <FiLock size={32} className={styles.lockIcon} />
                  <p className={styles.dropText}>Card bloqueado</p>
                  <p className={styles.dropHint}>
                    Desbloqueie para modificar o arquivo
                  </p>
                </>
              ) : (
                <>
                  <FiUploadCloud size={32} className={styles.uploadIcon} />
                  <p className={styles.dropText}>
                    {isUploading ? 'Enviando...' : 'Arraste um arquivo ou clique para escolher'}
                  </p>
                  <p className={styles.dropHint}>
                    Formatos: JPEG, PNG, GIF, WebP, MP4, WebM
                  </p>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isUploading || isLocked}
            />
          </div>
        )}
        
        {uploadError && (
          <div className={styles.errorMessage}>
            <FiAlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>Pré-visualização</span>
            {card.fileUrl && <FiCheck size={16} className={styles.checkIcon} />}
            {isLocked && <FiLock size={16} className={styles.lockIcon} />}
          </div>
          <div className={styles.previewContent}>
            {card.fileType === 'image' ? (
              <img 
                src={previewUrl} 
                alt={`Pré-visualização do Cartão ${index + 1}`} 
                className={styles.previewImage}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2VtIG7Do28gZGlzcG9uw612ZWw8L3RleHQ+PC9zdmc+';
                  alert.warning('Não foi possível carregar a imagem de preview', {
                    position: 'bottom-right',
                    autoCloseTime: 3000
                  });
                }}
              />
            ) : (
              <video 
                src={previewUrl} 
                className={styles.previewVideo} 
                controls
                preload="metadata"
                onError={(e) => {
                  e.target.style.display = 'none';
                  // Mostrar mensagem de erro
                  e.target.parentNode.innerHTML += `
                    <div class="${styles.videoError}">
                      <FiAlertCircle size={24} />
                      <p>Não foi possível carregar o vídeo</p>
                    </div>
                  `;
                  alert.warning('Não foi possível carregar o vídeo de preview', {
                    position: 'bottom-right',
                    autoCloseTime: 3000
                  });
                }}
              />
            )}
          </div>
          {card.fileUrl && (
            <div className={styles.previewActions}>
              <Button 
                variant="text"
                size="small"
                color="primary"
                as="a"
                href={card.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                iconLeft={<FiExternalLink size={14} />}
              >
                Ver original
              </Button>
              
              <Button
                variant="text"
                size="small"
                color="negative"
                onClick={handleClearUrl}
                iconLeft={<FiX size={14} />}
                disabled={isLocked}
              >
                Remover
              </Button>
              
              {/* Botão de alternar bloqueio */}
              <Button
                variant="text"
                size="small"
                color={isLocked ? "warning" : "secondary"}
                onClick={toggleLock}
                iconLeft={isLocked ? <FiUnlock size={14} /> : <FiLock size={14} />}
              >
                {isLocked ? "Desbloquear" : "Bloquear"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardUploadInput;