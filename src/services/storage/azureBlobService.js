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

    // URL base do serviço de blob
    const blobServiceUri = `https://${accountName}.blob.core.windows.net`;
    
    // FIX: Garantir que o token SAS comece com "?" se ainda não começar
    const formattedSasToken = sasToken.startsWith('?') ? sasToken : `?${sasToken}`;
    
    // Cliente do serviço de Blob com formato corrigido
    this.blobServiceClient = new BlobServiceClient(
      `${blobServiceUri}${formattedSasToken}`
    );
    
    // Cliente do container
    this.containerClient = this.blobServiceClient.getContainerClient(containerName);
    
    // Log para debug (remover em produção)
    console.log(`AzureBlobService inicializado para conta: ${accountName}, container: ${containerName}`);
  }

  // Método de upload com tratativa de erros detalhada e suporte para callback de progresso
  async uploadFile(file, options = {}) {
    try {
      // Extrair callback de progresso das opções
      const { onProgress } = options;
      
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
        },
        onProgress: onProgress ? (progress) => {
          // Calcular porcentagem de progresso
          const percentCompleted = Math.round((progress.loadedBytes / file.size) * 100);
          onProgress(percentCompleted);
        } : undefined,
      };
      
      try {
        // Log de debug (remover em produção)
        console.log(`Iniciando upload para ${blockBlobClient.url}`);
        
        // Realizar upload com a API de upload de dados
        await blockBlobClient.uploadData(file, uploadOptions);
        
        // Log de sucesso
        console.log(`Upload concluído com sucesso: ${blobName}`);
        
        // Retornar informações do arquivo
        return {
          url: blockBlobClient.url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        };
      } catch (uploadError) {
        // Tratativa específica para erros de upload
        console.error('Detalhes do erro de upload:', uploadError);
        
        // Verificar erros de CORS
        if (uploadError.message && uploadError.message.includes('CORS')) {
          throw new Error('Erro de CORS. Verifique as configurações do Azure Blob Storage.');
        }
        
        // Verificar erros de conexão
        if (uploadError.message && uploadError.message.includes('fetch')) {
          throw new Error('Falha na conexão com o Azure Blob Storage. Verifique sua conexão de internet.');
        }
        
        // Verificar erros de autenticação
        if (uploadError.statusCode === 403 || uploadError.statusCode === 401 || 
            (uploadError.message && uploadError.message.includes('authentication'))) {
          throw new Error('Falha na autenticação. Verifique seu token SAS.');
        }
        
        // Erro genérico de upload
        throw new Error(`Falha no upload do arquivo: ${uploadError.message || 'Erro desconhecido'}`);
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
    
    // Log de debug (remover em produção)
    console.log('Tentando criar serviço de Azure Blob Storage com:', { 
      accountName,
      containerName,
      sasTokenPresent: !!sasToken,
      sasTokenLength: sasToken ? sasToken.length : 0
    });
    
    // Criar e retornar a instância do serviço
    return new AzureBlobService(accountName, sasToken, containerName);
  } catch (error) {
    console.error('Erro ao criar serviço de Blob Storage:', error);
    // Log detalhado para ajudar no diagnóstico
    console.error('Detalhes do ambiente:', {
      nodeEnv: process.env.NODE_ENV,
      hasAccountName: !!process.env.REACT_APP_AZURE_STORAGE_ACCOUNT_NAME,
      hasSasToken: !!process.env.REACT_APP_AZURE_SAS_TOKEN,
      hasContainerName: !!process.env.REACT_APP_AZURE_CONTAINER_NAME
    });
    throw error;
  }
};