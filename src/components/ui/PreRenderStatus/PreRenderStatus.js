// src/components/ui/PreRenderStatus/PreRenderStatus.js
import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import styles from './PreRenderStatus.module.css';

/**
 * Componente que mostra o status de pré-renderização
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.downloadPreview - Serviço de download de pré-visualização
 * @param {boolean} props.preRenderStarted - Se a pré-renderização foi iniciada
 * @returns {JSX.Element} Componente de status
 */
const PreRenderStatus = ({ downloadPreview, preRenderStarted = false }) => {
  // Estado inicial com base no cache existente
  const [status, setStatus] = useState(() => {
    if (downloadPreview.cachedFiles?.mp4 && downloadPreview.cachedFiles?.gif) {
      return 'completed-all';
    } else if (downloadPreview.cachedFiles?.mp4 || downloadPreview.cachedFiles?.gif) {
      return 'completed-partial';
    } else if (downloadPreview.hasLocalStorageCache()) {
      return 'frames-stored';
    } else if (downloadPreview.capturedFramesCache) {
      return 'frames-captured';
    } else if (preRenderStarted) {
      return 'in-progress';
    } else {
      return 'idle';
    }
  });
  
  // Status de cada formato
  const [formatStatus, setFormatStatus] = useState({
    mp4: downloadPreview.cachedFiles?.mp4 ? 'completed' : 'pending',
    gif: downloadPreview.cachedFiles?.gif ? 'completed' : 'pending'
  });
  
  // Polling para verificar o estado do cache a cada 500ms
  useEffect(() => {
    const checkStatus = () => {
      // Verificar status de cada formato
      const mp4Status = downloadPreview.cachedFiles?.mp4 ? 'completed' : 'pending';
      const gifStatus = downloadPreview.cachedFiles?.gif ? 'completed' : 'pending';
      
      // Atualizar status dos formatos se mudou
      if (mp4Status !== formatStatus.mp4 || gifStatus !== formatStatus.gif) {
        setFormatStatus({
          mp4: mp4Status,
          gif: gifStatus
        });
      }
      
      // Verificar status geral
      if (downloadPreview.cachedFiles?.mp4 && downloadPreview.cachedFiles?.gif) {
        setStatus('completed-all');
      } else if (downloadPreview.cachedFiles?.mp4 || downloadPreview.cachedFiles?.gif) {
        setStatus('completed-partial');
      } else if (downloadPreview.hasLocalStorageCache()) {
        setStatus('frames-stored');
      } else if (downloadPreview.capturedFramesCache) {
        setStatus('frames-captured');
      } else if (preRenderStarted) {
        setStatus('in-progress');
      }
    };
    
    // Verificar imediatamente
    checkStatus();
    
    // E continuar verificando periodicamente
    const intervalId = setInterval(checkStatus, 500);
    
    return () => clearInterval(intervalId);
  }, [downloadPreview, preRenderStarted]);
  
  // Não mostrar nada se estiver ocioso
  if (status === 'idle') return null;
  
  return (
    <div className={styles.container}>
      {status === 'in-progress' && (
        <div className={styles.statusItem}>
          <FiClock className={styles.inProgressIcon} />
          <span className={styles.inProgressText}>
            Capturando frames em segundo plano...
          </span>
        </div>
      )}
      
      {status === 'frames-captured' && (
        <div className={styles.statusItem}>
          <FiClock className={styles.inProgressIcon} />
          <span className={styles.inProgressText}>
            Processando frames em segundo plano...
          </span>
        </div>
      )}
      
      {status === 'frames-stored' && (
        <div className={styles.statusItem}>
          <FiClock className={styles.inProgressIcon} />
          <span className={styles.inProgressText}>
            Preparando formatos em segundo plano...
          </span>
          <div className={styles.formatStatuses}>
            <span className={`${styles.formatStatus} ${formatStatus.mp4 === 'completed' ? styles.formatReady : ''}`}>
              {formatStatus.mp4 === 'completed' ? '✓' : '⟳'} MP4
            </span>
            <span className={`${styles.formatStatus} ${formatStatus.gif === 'completed' ? styles.formatReady : ''}`}>
              {formatStatus.gif === 'completed' ? '✓' : '⟳'} GIF
            </span>
          </div>
        </div>
      )}
      
      {status === 'completed-partial' && (
        <div className={styles.statusItem}>
          <FiCheckCircle className={styles.partialIcon} />
          <span className={styles.partialText}>
            Alguns formatos prontos para download rápido!
          </span>
          <div className={styles.formatStatuses}>
            <span className={`${styles.formatStatus} ${formatStatus.mp4 === 'completed' ? styles.formatReady : ''}`}>
              {formatStatus.mp4 === 'completed' ? '✓' : '⟳'} MP4
            </span>
            <span className={`${styles.formatStatus} ${formatStatus.gif === 'completed' ? styles.formatReady : ''}`}>
              {formatStatus.gif === 'completed' ? '✓' : '⟳'} GIF
            </span>
          </div>
        </div>
      )}
      
      {status === 'completed-all' && (
        <div className={styles.statusItem}>
          <FiCheckCircle className={styles.completedIcon} />
          <span className={styles.completedText}>
            Todos os formatos pré-carregados! Downloads serão instantâneos.
          </span>
          <div className={styles.formatStatuses}>
            <span className={`${styles.formatStatus} ${styles.formatReady}`}>✓ MP4</span>
            <span className={`${styles.formatStatus} ${styles.formatReady}`}>✓ GIF</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreRenderStatus;