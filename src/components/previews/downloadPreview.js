// src/components/previews/downloadPreview.js
// Versão otimizada com localStorage e pré-renderização otimizada

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import html2canvas from 'html2canvas';

// Constantes para a utilização do localStorage
const STORAGE_KEYS = {
  FRAMES: 'carousel-frames-cache',
  TIMESTAMP: 'carousel-cache-timestamp',
  TEMPLATE_HASH: 'carousel-template-hash'
};

class DownloadPreviewService {
  constructor() {
    this.ffmpeg = new FFmpeg({ log: true });
    this.isLoaded = false;

    // Cache para armazenar os blobs já gerados
    this.cachedFiles = {
      mp4: null,
      gif: null
    };

    // Cache para armazenar os frames intermediários
    this.capturedFramesCache = null;

    // Estado de pré-renderização
    this.isPreRendering = false;

    // Verificar cache no localStorage durante a inicialização
    this.loadFromLocalStorage();
  }

  // Gerar hash simples para identificar template
  generateTemplateHash(cards, bodyText, templateName) {
    try {
      const templateData = JSON.stringify({
        cardsLength: cards.length,
        bodyTextLength: bodyText?.length || 0,
        templateName: templateName || ''
      });

      // Hash simples para comparações
      let hash = 0;
      for (let i = 0; i < templateData.length; i++) {
        const char = templateData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converte para 32bit integer
      }

      return hash.toString();
    } catch (error) {
      console.error('Erro ao gerar hash do template:', error);
      return Date.now().toString(); // Fallback
    }
  }

  // Verifica se os dados são compatíveis com o template atual
  isCompatibleTemplate(currentHash) {
    const storedHash = localStorage.getItem(STORAGE_KEYS.TEMPLATE_HASH);
    return storedHash === currentHash;
  }

  // Carregar frames do localStorage
  loadFromLocalStorage() {
    try {
      // Verificar se temos timestamp e se é recente (menos de 24h)
      const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
      const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 86400000; // 24h

      if (!isRecent) {
        // Cache expirado, limpando
        this.clearLocalStorageCache();
        return false;
      }

      // Verificamos se existem frames armazenados
      const framesJSON = localStorage.getItem(STORAGE_KEYS.FRAMES);
      if (!framesJSON) return false;

      // Tentar descomprimir e reconstruir os frames
      try {
        const frameData = JSON.parse(framesJSON);

        if (!frameData || !frameData.images || !frameData.count) {
          throw new Error('Dados de frames inválidos');
        }

        // Reconstruir frames como objetos canvas
        this.capturedFramesCache = [];

        // Converter base64 strings de volta para canvas objects
        frameData.images.forEach(dataUrl => {
          const img = new Image();
          img.src = dataUrl;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Quando a imagem carregar, desenha no canvas
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          };

          this.capturedFramesCache.push(canvas);
        });

        console.log(`Carregados ${this.capturedFramesCache.length} frames do localStorage`);
        return true;
      } catch (error) {
        console.error('Erro ao reconstruir frames do localStorage:', error);
        this.clearLocalStorageCache();
        return false;
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return false;
    }
  }

  // Salvar frames em localStorage
  saveToLocalStorage(frames, templateHash) {
    try {
      if (!frames || frames.length === 0) return false;

      // Selecione alguns frames chave para salvar (para economizar espaço)
      // Pegar no máximo 15 frames distribuídos uniformemente
      const maxFramesToStore = 15;
      const step = Math.max(1, Math.floor(frames.length / maxFramesToStore));

      const selectedFrames = [];
      for (let i = 0; i < frames.length; i += step) {
        if (selectedFrames.length < maxFramesToStore) {
          selectedFrames.push(frames[i]);
        }
      }

      // Convertendo para base64 com menor qualidade para economizar espaço
      const frameDataUrls = selectedFrames.map(canvas => {
        try {
          // Usar toDataURL com menor qualidade para JPEG
          return canvas.toDataURL('image/jpeg', 0.7);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      // Criar objeto de dados
      const frameData = {
        count: frames.length,
        selectedCount: frameDataUrls.length,
        images: frameDataUrls,
        timestamp: Date.now()
      };

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEYS.FRAMES, JSON.stringify(frameData));
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
      localStorage.setItem(STORAGE_KEYS.TEMPLATE_HASH, templateHash);

      console.log(`Salvos ${frameDataUrls.length} frames para o template ${templateHash}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);

      // Se houver erro (provavelmente devido ao tamanho), limpe para evitar dados corrompidos
      this.clearLocalStorageCache();
      return false;
    }
  }

  // Limpa o cache do localStorage
  clearLocalStorageCache() {
    try {
      localStorage.removeItem(STORAGE_KEYS.FRAMES);
      localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
      localStorage.removeItem(STORAGE_KEYS.TEMPLATE_HASH);
    } catch (error) {
      console.error('Erro ao limpar cache do localStorage:', error);
    }
  }

  // Verifica se há cache no localStorage
  hasLocalStorageCache() {
    return !!localStorage.getItem(STORAGE_KEYS.FRAMES) &&
      !!localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
  }

  async initialize(retryCount = 0) {
    if (this.isLoaded) return;

    // Limit retries to prevent infinite loops
    const maxRetries = 3;

    try {
      console.log(`Iniciando carregamento do FFmpeg${retryCount > 0 ? ` (tentativa ${retryCount + 1})` : ''}...`);

      // Adicionar timeout para evitar travamento infinito
      const loadPromise = this.ffmpeg.load();

      // Race com um timeout de 30 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout ao carregar FFmpeg'));
        }, 30000);
      });

      await Promise.race([loadPromise, timeoutPromise]);

      this.isLoaded = true;
      console.log('FFmpeg carregado com sucesso');
    } catch (error) {
      console.error(`Erro ao inicializar FFmpeg (tentativa ${retryCount + 1}/${maxRetries + 1}):`, error);

      if (retryCount < maxRetries) {
        // Backoff exponencial: espera mais tempo entre tentativas
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 8000);
        console.log(`Tentando novamente em ${backoffTime / 1000} segundos...`);

        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.initialize(retryCount + 1);
      }

      throw new Error(`Falha ao carregar ferramentas de processamento de vídeo após ${maxRetries + 1} tentativas.`);
    }
  }

  // Método para pré-carregar o FFmpeg em segundo plano
  async preloadFFmpeg() {
    try {
      // Use um timeout para evitar bloquear a renderização inicial
      setTimeout(async () => {
        try {
          if (!this.isLoaded) {
            console.log('Pré-carregando FFmpeg em segundo plano...');
            await this.initialize();
            console.log('FFmpeg pré-carregado com sucesso');
          }
        } catch (error) {
          console.warn('Pré-carregamento do FFmpeg falhou silenciosamente:', error);
          // Não mostra erro ao usuário neste momento
        }
      }, 2000); // Espera 2 segundos antes de iniciar
    } catch (error) {
      // Ignora erros no pré-carregamento
      console.warn('Erro ao agendar pré-carregamento do FFmpeg:', error);
    }
  }

  // Limpa o sistema de arquivos virtual entre operações
  async cleanupFileSystem() {
    if (!this.isLoaded) return;

    try {
      console.log('Limpando sistema de arquivos...');

      // Limpar diretório de frames se existir - com tratamento de erro robusto
      try {
        // Primeiro, tentar ler o diretório
        let files = [];
        try {
          files = await this.ffmpeg.readDir('frames');
        } catch (readError) {
          console.log('Diretório frames não existe ou não pode ser lido, ignorando');
        }

        // Se conseguiu ler, deletar os arquivos um por um
        if (files && files.length > 0) {
          for (const file of files) {
            try {
              await this.ffmpeg.deleteFile(`frames/${file.name}`);
            } catch (deleteFileError) {
              console.warn(`Não foi possível deletar arquivo ${file.name}:`, deleteFileError);
              // Continuar mesmo se não conseguir deletar um arquivo
            }
          }
        }

        // Tentar deletar o diretório
        try {
          await this.ffmpeg.deleteDir('frames');
        } catch (deleteDirError) {
          console.warn('Não foi possível deletar diretório frames:', deleteDirError);
          // Continuar mesmo se não conseguir deletar o diretório
        }
      } catch (e) {
        console.warn('Erro ao limpar diretório frames:', e);
        // Diretório pode não existir ainda, isso é normal
      }

      // Remover arquivos de saída anteriores
      try {
        await this.ffmpeg.deleteFile('output.mp4');
      } catch (mp4Error) {
        console.log('Arquivo output.mp4 não existe ou não pode ser deletado');
      }

      try {
        await this.ffmpeg.deleteFile('output.gif');
      } catch (gifError) {
        console.log('Arquivo output.gif não existe ou não pode ser deletado');
      }

      console.log('Limpeza do sistema de arquivos concluída');
    } catch (error) {
      console.warn('Aviso durante limpeza do sistema de arquivos:', error);
    }
  }

  /**
   * Captura frames com transições suaves, gerando múltiplos frames intermediários 
   * para simular a animação entre slides
   */
  async captureFrames(containerElement, cards, navigationControls, onStatusUpdate, templateHash) {
    if (!containerElement) {
      throw new Error('Container de pré-visualização não encontrado');
    }

    if (!navigationControls || !navigationControls.goToCard) {
      throw new Error('Controles de navegação do carrossel não fornecidos');
    }

    // Se já temos cache compatível no localStorage, devemos usá-lo
    if (this.capturedFramesCache && templateHash && this.isCompatibleTemplate(templateHash)) {
      onStatusUpdate?.({ status: 'cached', message: 'Usando frames do cache local...' });
      return this.capturedFramesCache;
    }

    onStatusUpdate?.({ status: 'capturing', message: 'Capturando imagens...' });
    const frames = [];
    const numCards = cards.length;

    try {
      // Função auxiliar para verificar carregamento completo de imagens e vídeos
      const waitForMediaLoad = async (container) => {
        const images = container.querySelectorAll('img');
        const videos = container.querySelectorAll('video');

        await Promise.all([...images].map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Resolve também em caso de erro
            setTimeout(resolve, 500);
          });
        }));

        await Promise.all([...videos].map(video => {
          if (video.readyState >= 3) return Promise.resolve();
          return new Promise(resolve => {
            video.oncanplaythrough = resolve;
            video.onerror = resolve;
            setTimeout(resolve, 500);
          });
        }));
      };

      // Transição suave entre dois cards
      const captureTransition = async (fromCardIndex, toCardIndex, transitionSteps = 8) => {
        // Primeiro, vamos para o card inicial
        navigationControls.goToCard(fromCardIndex);
        await new Promise(resolve => setTimeout(resolve, 300));
        await waitForMediaLoad(containerElement);

        // Capturamos o frame inicial
        const startFrame = await html2canvas(containerElement, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        frames.push(startFrame);

        // Agora vamos para o card final e capturamos várias imagens durante a transição
        navigationControls.goToCard(toCardIndex);

        // Captura vários frames durante a transição para um efeito mais suave
        for (let step = 0; step < transitionSteps; step++) {
          // Esperar um tempo proporcional para cada passo da transição
          // Sendo o primeiro mais longo para dar tempo de iniciar
          const delay = step === 0 ? 100 : 30;
          await new Promise(resolve => setTimeout(resolve, delay));

          // Capturar um frame da transição
          const transitionFrame = await html2canvas(containerElement, {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true,
            logging: false
          });

          frames.push(transitionFrame);
        }

        // Capturamos o frame final
        await waitForMediaLoad(containerElement);
        const endFrame = await html2canvas(containerElement, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        frames.push(endFrame);

        // Repetimos o último frame algumas vezes para que o card seja exibido 
        // por um tempo adequado antes da próxima transição
        for (let i = 0; i < 5; i++) {
          frames.push(endFrame);
        }
      };

      // Capturar o primeiro card
      navigationControls.goToCard(0);
      await new Promise(resolve => setTimeout(resolve, 300));
      await waitForMediaLoad(containerElement);

      // Capturar o frame inicial e duplicá-lo algumas vezes para
      // que o primeiro card seja exibido por tempo adequado
      const firstFrame = await html2canvas(containerElement, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Adicionar frame inicial várias vezes (permanência inicial)
      for (let i = 0; i < 10; i++) {
        frames.push(firstFrame);
      }

      // Capturar transições entre todos os cards
      for (let i = 0; i < numCards - 1; i++) {
        onStatusUpdate?.({
          status: 'capturing',
          message: `Capturando transição ${i + 1}/${numCards - 1}...`,
          progress: Math.round((i / (numCards - 1)) * 100)
        });

        await captureTransition(i, i + 1);
      }

      // Adicionar a transição do último card de volta para o primeiro,
      // simulando a navegação cíclica do carrossel
      if (numCards > 1) {
        onStatusUpdate?.({
          status: 'capturing',
          message: `Capturando transição circular...`
        });

        await captureTransition(numCards - 1, 0);
      }

      console.log(`Total de ${frames.length} frames capturados para a animação`);

      // Armazenar em cache para uso futuro
      this.capturedFramesCache = frames;

      // Salvar no localStorage se tivermos um hash do template
      if (templateHash) {
        this.saveToLocalStorage(frames, templateHash);
      }

      return frames;
    } catch (error) {
      console.error('Erro ao capturar frames:', error);
      throw new Error(`Falha ao capturar imagens do carrossel: ${error.message}`);
    }
  }

  async generateVideo(frames, templateName, onStatusUpdate) {
    // Verificar se já temos um vídeo em cache
    if (this.cachedFiles.mp4) {
      console.log('Usando vídeo em cache');
      onStatusUpdate?.({ status: 'cached', message: 'Usando arquivo gerado anteriormente...' });
      return this.cachedFiles.mp4;
    }

    try {
      if (!this.isLoaded) {
        await this.initialize();
      }

      // Limpar sistema de arquivos antes de começar
      await this.cleanupFileSystem();

      onStatusUpdate?.({ status: 'processing', message: 'Processando frames...' });
      console.log(`Iniciando processamento de ${frames.length} frames`);

      // Criar diretório temporário
      await this.ffmpeg.createDir('frames');

      // Processar cada frame com tratamento de erro aprimorado
      for (let i = 0; i < frames.length; i++) {
        onStatusUpdate?.({
          status: 'processing',
          message: `Processando frame ${i + 1}/${frames.length}...`,
          progress: Math.round((i / frames.length) * 100)
        });

        const dataUrl = frames[i].toDataURL('image/png');
        const fileName = `frames/frame_${i.toString().padStart(4, '0')}.png`;

        try {
          await this.ffmpeg.writeFile(fileName, await fetchFile(dataUrl));
        } catch (frameError) {
          console.error(`Erro ao processar frame ${i + 1}:`, frameError);
          throw new Error(`Falha ao processar frame ${i + 1}`);
        }
      }

      onStatusUpdate?.({ status: 'encoding', message: 'Gerando vídeo...' });

      // Aumentar framerate para animação mais suave
      await this.ffmpeg.exec([
        '-framerate', '30',  // 30 FPS para melhor suavidade
        '-pattern_type', 'glob',
        '-i', 'frames/frame_*.png',
        '-c:v', 'libx264',
        '-preset', 'slow',  // Compressão mais eficiente, qualidade melhor
        '-crf', '20',  // Qualidade visual quase sem perdas (quanto menor, melhor)
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'high',  // Usa perfil alto do H.264 para melhor qualidade
        '-tune', 'film',  // Ajusta parâmetros para vídeos que parecem filmes
        '-movflags', '+faststart',
        '-vf', 'format=yuv420p',
        'output.mp4'
      ]);

      // Ler arquivo gerado
      const data = await this.ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Salvar em cache para uso futuro
      this.cachedFiles.mp4 = blob;

      return blob;

    } catch (error) {
      console.error('Erro ao gerar vídeo:', error);
      throw new Error(`Falha ao gerar vídeo: ${error.message}`);
    }
  }

  async generateGif(frames, templateName, onStatusUpdate) {
    // Verificar se já temos um GIF em cache
    if (this.cachedFiles.gif) {
      console.log('Usando GIF em cache');
      onStatusUpdate?.({ status: 'cached', message: 'Usando arquivo gerado anteriormente...' });
      return this.cachedFiles.gif;
    }

    try {
      if (!this.isLoaded) {
        await this.initialize();
      }

      // Limpar sistema de arquivos antes de começar
      await this.cleanupFileSystem();

      onStatusUpdate?.({ status: 'processing', message: 'Processando frames para GIF...' });

      // Criar diretório para frames
      try {
        await this.ffmpeg.createDir('frames');
      } catch (dirError) {
        console.warn("Erro ao criar diretório, tentando continuar:", dirError);
        // Continuar mesmo se o diretório já existir
      }

      // Selecionar apenas um subconjunto de frames para reduzir o tamanho
      // Pegar no máximo 30 frames distribuídos uniformemente
      const maxFramesToProcess = 30;
      const frameStep = Math.max(1, Math.floor(frames.length / maxFramesToProcess));
      const selectedFrames = [];

      for (let i = 0; i < frames.length; i += frameStep) {
        if (selectedFrames.length < maxFramesToProcess) {
          selectedFrames.push(frames[i]);
        }
      }

      console.log(`Processando ${selectedFrames.length} frames para GIF (de ${frames.length} totais)`);

      // Escrever os frames selecionados no sistema de arquivos
      for (let i = 0; i < selectedFrames.length; i++) {
        onStatusUpdate?.({
          status: 'processing',
          message: `Processando frame ${i + 1}/${selectedFrames.length}...`,
          progress: Math.round((i / selectedFrames.length) * 100)
        });

        try {
          // Usar JPEG em vez de PNG para economia de espaço
          const dataUrl = selectedFrames[i].toDataURL('image/jpeg', 0.8);
          const fileName = `frames/frame_${i.toString().padStart(4, '0')}.jpg`;
          await this.ffmpeg.writeFile(fileName, await fetchFile(dataUrl));
        } catch (frameError) {
          console.error(`Erro ao processar frame ${i + 1}:`, frameError);
          // Continuar mesmo com erro em um frame
        }
      }

      onStatusUpdate?.({ status: 'encoding', message: 'Gerando GIF...' });

      // Comando FFmpeg extremamente simplificado e robusto
      try {
        // Passo 1: Gerar a paleta de cores otimizada
        await this.ffmpeg.exec([
          '-framerate', '15',
          '-pattern_type', 'glob',
          '-i', 'frames/frame_*.png',
          '-vf', 'palettegen',
          '-y', 'palette.png'
        ]);

        // Passo 2: Criar o GIF usando a paleta gerada
        await this.ffmpeg.exec([
          '-framerate', '15',
          '-pattern_type', 'glob',
          '-i', 'frames/frame_*.png',
          '-i', 'palette.png',  // Usa a paleta gerada no passo anterior
          '-lavfi', 'fps=15,scale=480:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=floyd_steinberg',
          '-loop', '0',
          'output.gif'
        ]);
      } catch (execError) {
        console.error("Erro na execução do FFmpeg:", execError);
        throw new Error(`Erro ao executar FFmpeg: ${execError.message}`);
      }

      // Ler o arquivo resultante
      let data;
      try {
        data = await this.ffmpeg.readFile('output.gif');
      } catch (readError) {
        console.error("Erro ao ler arquivo GIF:", readError);
        throw new Error(`Erro ao ler GIF gerado: ${readError.message}`);
      }

      const blob = new Blob([data.buffer], { type: 'image/gif' });

      // Salvar em cache para uso futuro
      this.cachedFiles.gif = blob;

      // Limpar sistema de arquivos após sucesso
      try {
        await this.cleanupFileSystem();
      } catch (cleanError) {
        console.warn("Erro ao limpar sistema de arquivos:", cleanError);
        // Não interromper por erro na limpeza
      }

      return blob;

    } catch (error) {
      console.error('Erro ao gerar GIF:', error);

      // Tentar limpar o sistema de arquivos mesmo em caso de erro
      try {
        await this.cleanupFileSystem();
      } catch (cleanError) {
        console.warn("Erro ao limpar sistema de arquivos após falha:", cleanError);
      }

      throw new Error(`Falha ao gerar GIF: ${error.message || 'Erro desconhecido'}`);
    }
  }

  // Método para pré-renderizar frames e formatos (MP4 e GIF) de forma assíncrona
  async preRenderAnimations(containerElement, cards, bodyText, templateName, navigationControls, onStatusUpdate) {
    try {
      // Indica que está em processo de pré-renderização
      this.isPreRendering = true;

      console.log("Iniciando pré-renderização dos frames...");

      // Gerar hash do template para armazenamento
      const templateHash = this.generateTemplateHash(cards, bodyText, templateName);

      // Verificar se já temos cache compatível
      if (this.capturedFramesCache && this.isCompatibleTemplate(templateHash)) {
        console.log("Usando frames pré-renderizados do cache");

        // Já temos frames, agora vamos pré-renderizar os formatos em segundo plano
        // Mas não vamos manter o bloqueio da interface
        this.isPreRendering = false;

        // Pré-renderizar MP4 e GIF em segundo plano
        this.preRenderFormats(templateName, onStatusUpdate);

        return true;
      }

      // Capturar todos os frames
      const frames = await this.captureFrames(
        containerElement,
        cards,
        navigationControls,
        onStatusUpdate,
        templateHash
      );

      // Terminamos a captura de frames, não precisamos mais bloquear a interface
      this.isPreRendering = false;
      console.log("Frames pré-renderizados com sucesso");

      // Agora vamos gerar os formatos em segundo plano
      this.preRenderFormats(templateName, onStatusUpdate);

      return true;
    } catch (error) {
      this.isPreRendering = false;
      console.error("Erro ao pré-renderizar frames:", error);
      return false;
    }
  }

  // Método para pré-renderizar MP4 e GIF em segundo plano
  async preRenderFormats(templateName, onStatusUpdate) {
    // Se não tivermos frames capturados, não podemos gerar os formatos
    if (!this.capturedFramesCache || this.capturedFramesCache.length === 0) {
      console.warn("Não há frames para pré-renderizar formatos");
      return false;
    }

    // Não bloqueamos a interface durante a geração dos formatos
    console.log("Iniciando pré-renderização de formatos em segundo plano...");

    // Pre-renderizar MP4
    if (!this.cachedFiles.mp4) {
      try {
        console.log("Pré-renderizando MP4...");
        const mp4Blob = await this.generateVideo(this.capturedFramesCache, templateName, status => {
          console.log(`Pré-renderização MP4: ${status.message || status.status}`);
        });
        console.log("MP4 pré-renderizado com sucesso");
      } catch (error) {
        console.error("Erro na pré-renderização do MP4:", error);
      }
    }

    // Pre-renderizar GIF
    if (!this.cachedFiles.gif) {
      try {
        console.log("Pré-renderizando GIF...");
        const gifBlob = await this.generateGif(this.capturedFramesCache, templateName, status => {
          console.log(`Pré-renderização GIF: ${status.message || status.status}`);
        });
        console.log("GIF pré-renderizado com sucesso");
      } catch (error) {
        console.error("Erro na pré-renderização do GIF:", error);
      }
    }

    return true;
  }

  // Verificar se está em pré-renderização
  isPreRenderingActive() {
    return this.isPreRendering;
  }

  // Método para limpar o cache quando necessário (por exemplo, quando o conteúdo muda)
  clearCache() {
    this.cachedFiles = {
      mp4: null,
      gif: null
    };
    this.capturedFramesCache = null;
    this.clearLocalStorageCache();
    console.log('Cache de arquivos limpo');
  }

  async downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async generateStaticImage(element, templateName) {
    try {
      if (!element) {
        throw new Error('Container de pré-visualização não encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Erro ao gerar imagem estática:', error);
      throw new Error('Falha ao gerar imagem estática');
    }
  }
}

export const downloadPreview = new DownloadPreviewService();