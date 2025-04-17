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
    
    // Log para debug 
    console.log(`AzureBlobService inicializado para conta: ${accountName}, container: ${containerName}`);
  }

  // Método de upload com tratativa de erros detalhada e verificação de container
  async uploadFile(file, options = {}) {
    try {
      // Extrair callback de progresso das opções
      const { onProgress } = options;
      
      // Validar arquivo
      validateFile(file);

      // Verificar se o container existe
      try {
        const containerExists = await this.containerClient.exists();
        if (!containerExists) {
          console.error(`O container especificado não existe: ${this.containerClient.containerName}`);
          throw new Error(`O container '${this.containerClient.containerName}' não existe. Verifique as configurações.`);
        }
      } catch (containerError) {
        console.error('Erro ao verificar container:', containerError);
        throw new Error(`Não foi possível verificar o container: ${containerError.message}`);
      }

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
        // Log de debug
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
          
          // Fornecer mais detalhes sobre o erro de autenticação
          const errorDetails = uploadError.message || 'Erro de autenticação desconhecido';
          console.error('Detalhes do erro de autenticação:', {
            url: blockBlobClient.url,
            statusCode: uploadError.statusCode,
            message: errorDetails
          });
          
          throw new Error(`Falha na autenticação. Verifique seu token SAS e permissões. Detalhes: ${errorDetails}`);
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

// Função de criação do serviço com verificação de container e debug avançado
export const createAzureBlobService = () => {
  try {
    const accountName = process.env.REACT_APP_AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.REACT_APP_AZURE_SAS_TOKEN;
    const containerName = process.env.REACT_APP_AZURE_CONTAINER_NAME || 'uploads';
    
    // Verificar se as variáveis estão definidas corretamente
    console.log('Tentando criar serviço de Azure Blob Storage com:', { 
      accountName,
      containerName,
      sasTokenPresent: !!sasToken,
      sasTokenLength: sasToken ? sasToken.length : 0
    });
    
    // Log para verificar o formato da URL
    if (accountName && sasToken) {
      // Remover caracteres de quebra de linha ou espaços que possam ter sido adicionados
      const cleanSasToken = sasToken.trim();
      const formattedSasToken = cleanSasToken.startsWith('?') ? cleanSasToken : `?${cleanSasToken}`;
      
      // Log com valores mascarados para debug
      console.log('URL do serviço que será construída:', 
        `https://${accountName}.blob.core.windows.net${formattedSasToken.substring(0, 10)}...`);
    }
    
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

// Exportar uma função de teste para verificação rápida
export const testAzureConnection = async () => {
  try {
    const accountName = process.env.REACT_APP_AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.REACT_APP_AZURE_SAS_TOKEN;
    const containerName = process.env.REACT_APP_AZURE_CONTAINER_NAME || 'uploads';
    
    // Garantir que o token SAS comece com "?"
    const formattedSasToken = sasToken.startsWith('?') ? sasToken : `?${sasToken}`;
    
    // Construir URL do serviço de blob
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net${formattedSasToken}`;
    
    // Criar cliente do serviço de blob
    const blobServiceClient = new BlobServiceClient(blobServiceUrl);
    
    // Tente obter informações da conta para verificar a conexão
    await blobServiceClient.getAccountInfo();
    
    // Verificar container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const containerExists = await containerClient.exists();
    
    return {
      success: true,
      accountConnected: true,
      containerExists,
      containerName
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};