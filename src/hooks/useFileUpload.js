// hooks/useFileUpload.js
import { useState, useCallback } from 'react';
import { useAlert } from '../components/ui/AlertMessage/AlertContext'; // Importar o hook de alertas
import { createAzureBlobService } from '../services/storage/azureBlobService';

/**
 * Hook para gerenciar uploads de arquivos para o Azure Blob Storage
 * Agora com sistema de alertas integrado
 * @returns {Object} Métodos e estados para controle de upload
 */
export const useFileUpload = () => {
  // Estados para controle do upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Inicializar sistema de alertas
  const alert = useAlert();

  /**
   * Realiza o upload de um arquivo para o Azure Blob Storage
   * @param {File} file Arquivo a ser enviado
   * @param {Object} options Opções adicionais de upload
   * @returns {Promise<Object>} Resultado do upload
   */
  const uploadToAzure = useCallback(async (file, options = {}) => {
    // Resetar estados
    setIsUploading(true);
    setUploadError('');
    setUploadedFile(null);
    setUploadProgress(0);
    
    // Mostrar alerta de upload iniciado
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    alert.info(`Upload de "${file.name}" iniciado (${fileSize}MB).`, {
      position: 'bottom-right',
      autoCloseTime: 3000
    });

    try {
      // Criar serviço de upload
      const azureBlobService = createAzureBlobService();

      // Configurar callback de progresso
      const onProgress = (progress) => {
        setUploadProgress(progress);
        
        // Alertas de progresso em marcos específicos
        if (progress === 25 || progress === 50 || progress === 75) {
          alert.info(`Upload ${progress}% concluído.`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      };

      // Realizar upload com progresso
      const uploadResult = await azureBlobService.uploadFile(file, {
        ...options,
        onProgress
      });

      // Atualizar estados
      setUploadedFile(uploadResult);
      
      // Mostrar alerta de sucesso
      alert.success(`Upload de "${file.name}" concluído com sucesso!`, {
        position: 'top-right'
      });
      
      return uploadResult;
    } catch (error) {
      // Tratar erros
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Erro no upload do arquivo');
      
      // Mostrar alerta de erro
      alert.error(`Falha no upload: ${error.message || 'Erro desconhecido'}. Tente novamente.`, {
        position: 'top-center',
        autoCloseTime: 7000
      });
      
      throw error;
    } finally {
      // Finalizar upload
      setIsUploading(false);
    }
  }, [alert]);

  /**
   * Cancela o upload em andamento (se suportado pelo serviço)
   */
  const cancelUpload = useCallback(() => {
    // Implementação depende do serviço de upload
    // Para este exemplo, apenas mostramos um alerta
    alert.warning("Upload cancelado pelo usuário.", {
      position: 'bottom-right',
      autoCloseTime: 3000
    });
    
    setIsUploading(false);
  }, [alert]);

  /**
   * Limpa estados do upload
   */
  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadError('');
    setUploadedFile(null);
    setUploadProgress(0);
  }, []);

  return {
    uploadToAzure,
    isUploading,
    uploadError,
    uploadedFile,
    uploadProgress,
    cancelUpload,
    resetUpload
  };
};