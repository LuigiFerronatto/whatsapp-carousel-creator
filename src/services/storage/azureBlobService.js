// services/storage/azureBlobService.js

import { BlobServiceClient } from "@azure/storage-blob";
import { validateFile } from "../validation/validationService";

export class AzureBlobService {
  constructor(accountName, sasToken, containerName = 'uploads') {
    // Validar configurações com mensagens detalhadas
    if (!accountName) {
      throw new Error('Nome da conta de armazenamento Azure não foi fornecido');
    }

    if (!sasToken) {
      throw new Error('Token SAS para Azure Blob Storage não foi fornecido');
    }

    // URL do serviço de blob
    const blobServiceUri = `https://${accountName}.blob.core.windows.net`;

    // Cliente do serviço de Blob
    this.blobServiceClient = new BlobServiceClient(
      `${blobServiceUri}?${sasToken}`
    );

    // Cliente do container
    this.containerClient = this.blobServiceClient.getContainerClient(containerName);
  }

  // Método de upload com tratativa de erros detalhada
  async uploadFile(file) {
    try {
      // Validar arquivo
      validateFile(file);

      // Nome único para o arquivo
      const blobName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Cliente do blob específico
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Opções de upload
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.type, // Mantém o tipo MIME original
        }
      };

      try {
        // Realizar upload
        await blockBlobClient.uploadData(file, uploadOptions);

        // Retornar informações do arquivo
        return {
          url: blockBlobClient.url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: blobName
        };
      } catch (uploadError) {
        // Tratativa específica para erros de upload
        console.error('Detalhes do erro de upload:', uploadError);

        // Verificar erros de CORS
        if (uploadError.message.includes('CORS')) {
          throw new Error('Erro de CORS. Verifique as configurações do Azure Blob Storage.');
        }

        // Verificar erros de conexão
        if (uploadError.message.includes('fetch')) {
          throw new Error('Falha na conexão com o Azure Blob Storage. Verifique sua conexão de internet.');
        }

        // Verificar erros de autenticação
        if (uploadError.statusCode === 403 || uploadError.statusCode === 401) {
          throw new Error('Falha na autenticação. Verifique seu token SAS.');
        }

        // Erro genérico de upload
        throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
      }
    } catch (validationError) {
      // Tratativa de erros de validação
      console.error('Erro de validação:', validationError);
      throw validationError;
    }
  }
}

// Função de criação do serviço com log de erros
export const createAzureBlobService = () => {
  try {
    const accountName = process.env.REACT_APP_AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.REACT_APP_AZURE_SAS_TOKEN;
    const containerName = process.env.REACT_APP_AZURE_CONTAINER_NAME || 'uploads';

    // Log de configurações (cuidado para não logar tokens sensíveis)
    console.log('Configurações do Azure Blob Storage:', {
      accountName,
      containerName,
      sasTokenPresent: !!sasToken
    });

    return new AzureBlobService(accountName, sasToken, containerName);
  } catch (error) {
    console.error('Erro ao criar serviço de Blob Storage:', error);
    throw error;
  }
};