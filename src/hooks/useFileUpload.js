// hooks/useFileUpload.js
import { useState } from 'react';
import { createAzureBlobService } from '../services/storage/azureBlobService';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const uploadToAzure = async (file) => {
    // Resetar estados
    setIsUploading(true);
    setUploadError('');
    setUploadedFile(null);

    try {
      // Criar serviço de upload
      const azureBlobService = createAzureBlobService();

      // Realizar upload
      const uploadResult = await azureBlobService.uploadFile(file);

      // Atualizar estados
      setUploadedFile(uploadResult);
      return uploadResult;
    } catch (error) {
      // Tratar erros
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Erro no upload do arquivo');
      throw error;
    } finally {
      // Finalizar upload
      setIsUploading(false);
    }
  };

  // Limpar estados
  const resetUpload = () => {
    setIsUploading(false);
    setUploadError('');
    setUploadedFile(null);
  };

  return {
    uploadToAzure,
    isUploading,
    uploadError,
    uploadedFile,
    resetUpload
  };
};