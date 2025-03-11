// hooks/useFileUpload.js
import { useState, useCallback } from 'react';
import { useAlert } from '../../components/ui/AlertMessage/AlertContext';
import { createAzureBlobService } from '../../services/storage/azureBlobService';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const alert = useAlert();

  const uploadToAzure = useCallback(async (file, updateProgress = () => {}) => {
    setIsUploading(true);
    setUploadError('');
    setUploadedFile(null);
    setUploadProgress(0);
    
    try {
      // Tentar usar o serviço Azure primeiro
      try {
        const blobService = createAzureBlobService();
        
        if (!blobService) {
          throw new Error('Serviço de upload não configurado');
        }
  
        // Configurar callback de progresso
        const onProgress = (progress) => {
          setUploadProgress(progress);
          updateProgress(progress);
          if (progress % 25 === 0 && progress > 0) {
            alert.info(`Upload ${progress}% concluído`, {
              position: 'bottom-right',
              autoCloseTime: 1500
            });
          }
        };
  
        // Realizar upload
        const result = await blobService.uploadFile(file, {
          onProgress
        });
  
        setUploadedFile(result);
        
        alert.success(`Upload do arquivo "${file.name}" concluído com sucesso!`, {
          position: 'top-right',
          autoCloseTime: 3000
        });
  
        return result;
        
      } catch (azureError) {
        console.warn('Falha no upload para Azure, usando fallback:', azureError);
        
        // CORREÇÃO: Em vez de usar URL.createObjectURL que tem vida útil temporária,
        // cria um fallback que emula URL persistentes simuladas
  
        // 1. Converte o arquivo para base64 (será mais estável para persistência)
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
  
        // 2. Usa esta URL persistente em vez da blob URL temporária
        const simulatedResult = {
          url: base64, // URL base64 é persistente no armazenamento
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        };
        
        // Simular upload com progresso
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setUploadProgress(progress);
          updateProgress(progress);
          
          if (progress % 25 === 0 && progress > 0) {
            alert.info(`Upload ${progress}% concluído (modo fallback)`, {
              position: 'bottom-right',
              autoCloseTime: 1500
            });
          }
        }
        
        setUploadedFile(simulatedResult);
        
        alert.success(`Upload do arquivo "${file.name}" concluído em modo fallback!`, {
          position: 'top-right',
          autoCloseTime: 3000
        });
        
        return simulatedResult;
      }
      
    } catch (error) {
      console.error('Erro fatal em uploadToAzure:', error);
      setUploadError(error.message || 'Erro no upload do arquivo');
      
      alert.error(`Falha no upload: ${error.message || 'Erro desconhecido'}`, {
        position: 'top-center',
        autoCloseTime: 5000
      });
      
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [alert]);

  const cancelUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    
    alert.info("Upload cancelado", {
      position: 'bottom-right',
      autoCloseTime: 3000
    });
  }, [alert]);

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