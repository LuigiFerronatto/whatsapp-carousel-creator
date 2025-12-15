// src/components/ui/PreRenderStatus/PreRenderStatus.js
import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiLoader } from 'react-icons/fi';
import styles from './PreRenderStatus.module.css';

/**
 * Enhanced component that shows the pre-rendering status
 * @param {Object} props - Component properties
 * @param {Object} props.downloadPreview - Download preview service
 * @param {boolean} props.preRenderStarted - If pre-rendering has started
 * @returns {JSX.Element} Status component
 */
const PreRenderStatus = ({ downloadPreview, preRenderStarted = false }) => {
  // Initial state based on existing cache
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
  
  // Format status
  const [formatStatus, setFormatStatus] = useState({
    mp4: downloadPreview.cachedFiles?.mp4 ? 'completed' : 'pending',
    gif: downloadPreview.cachedFiles?.gif ? 'completed' : 'pending'
  });
  
  // Poll to check cache status every 500ms
  useEffect(() => {
    const checkStatus = () => {
      // Check status of each format
      const mp4Status = downloadPreview.cachedFiles?.mp4 ? 'completed' : 'pending';
      const gifStatus = downloadPreview.cachedFiles?.gif ? 'completed' : 'pending';
      
      // Update format status if changed
      if (mp4Status !== formatStatus.mp4 || gifStatus !== formatStatus.gif) {
        setFormatStatus({
          mp4: mp4Status,
          gif: gifStatus
        });
      }
      
      // Check overall status
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
    
    // Check immediately
    checkStatus();
    
    // And continue checking periodically
    const intervalId = setInterval(checkStatus, 500);
    
    return () => clearInterval(intervalId);
  }, [downloadPreview, preRenderStarted]);
  
  // Don't show anything if idle
  if (status === 'idle') return null;

  // Helper to determine how many formats are ready
  const getCompletedCount = () => {
    let count = 0;
    if (formatStatus.mp4 === 'completed') count++;
    if (formatStatus.gif === 'completed') count++;
    return count;
  };
  
  return (
    <div className={styles.container}>
      {status === 'in-progress' && (
        <div className={styles.statusCard}>
          <div className={styles.statusIconWrapper + ' ' + styles.inProgress}>
            <FiLoader className={styles.statusIcon} />
          </div>
          <div className={styles.statusContent}>
            <h4 className={styles.statusTitle}>Estamos animando, estamos animando!</h4>
            <p className={styles.statusMessage}>
              Segura aí! Estamos criando uma animação do seu carrossel...
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progressIndeterminate}></div>
            </div>
          </div>
        </div>
      )}
      
      {status === 'frames-captured' && (
        <div className={styles.statusCard}>
          <div className={styles.statusIconWrapper + ' ' + styles.inProgress}>
            <FiClock className={styles.statusIcon} />
          </div>
          <div className={styles.statusContent}>
            <h4 className={styles.statusTitle}>Processando Quadros</h4>
            <p className={styles.statusMessage}>
              Quase lá! Que carrossel bonito esse seu 🤩...
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progressIndeterminate}></div>
            </div>
          </div>
        </div>
      )}
      
      {status === 'frames-stored' && (
        <div className={styles.statusCard}>
          <div className={styles.statusIconWrapper + ' ' + styles.inProgress}>
            <FiRefreshCw className={styles.statusIcon} />
          </div>
          <div className={styles.statusContent}>
            <h4 className={styles.statusTitle}>Preparando Formatos</h4>
            <p className={styles.statusMessage}>
              Gerando seus formatos de download, aguenta firme...
            </p>
            <div className={styles.formatContainer}>
              <div className={`${styles.formatBadge} ${formatStatus.mp4 === 'completed' ? styles.formatComplete : ''}`}>
                {formatStatus.mp4 === 'completed' ? '✓' : '✕'} MP4
              </div>
              <div className={`${styles.formatBadge} ${formatStatus.gif === 'completed' ? styles.formatComplete : ''}`}>
                {formatStatus.gif === 'completed' ? '✓' : '✕'} GIF
              </div>
            </div>
          </div>
        </div>
      )}
      
      {status === 'completed-partial' && (
        <div className={styles.statusCard}>
          <div className={styles.statusIconWrapper + ' ' + styles.partialSuccess}>
            <FiCheckCircle className={styles.statusIcon} />
          </div>
          <div className={styles.statusContent}>
            <h4 className={styles.statusTitle}>Formatos Prontos</h4>
            <p className={styles.statusMessage}>
              {getCompletedCount()} de 2 formatos prontos para download!
            </p>
            <div className={styles.formatContainer}>
              <div className={`${styles.formatBadge} ${formatStatus.mp4 === 'completed' ? styles.formatComplete : ''}`}>
                {formatStatus.mp4 === 'completed' ? '✓' : '✕'} MP4
              </div>
              <div className={`${styles.formatBadge} ${formatStatus.gif === 'completed' ? styles.formatComplete : ''}`}>
                {formatStatus.gif === 'completed' ? '✓' : '✕'} GIF
              </div>
            </div>
          </div>
        </div>
      )}
      
      {status === 'completed-all' && (
        <div className={styles.statusCard}>
          <div className={styles.statusIconWrapper + ' ' + styles.success}>
            <FiCheckCircle className={styles.statusIcon} />
          </div>
          <div className={styles.statusContent}>
            <h4 className={styles.statusTitle}>Todos os Formatos Prontos</h4>
            <p className={styles.statusMessage}>
              Todos os formatos estão prontos! Faça o download agora mesmo!
            </p>
            <div className={styles.formatContainer}>
              <div className={`${styles.formatBadge} ${styles.formatComplete}`}>✓ MP4</div>
              <div className={`${styles.formatBadge} ${styles.formatComplete}`}>✓ GIF</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreRenderStatus;