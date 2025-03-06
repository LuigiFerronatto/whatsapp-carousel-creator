// components/steps/StepThree.js
import React, { useState, useRef, useEffect, memo } from 'react';
import AlertMessage from '../ui/AlertMessage/AlertMessage';
import CarouselPreview from '../previews/CarouselPreview';
import Button from '../ui/Button/Button';
import JsonViewer from '../ui/JsonViewer/JsonViewer';
import html2canvas from 'html2canvas';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { toBlobURL } from '@ffmpeg/util';
import { 
  FiChevronLeft, 
  FiCopy, 
  FiCheck, 
  FiSend, 
  FiCode, 
  FiEye,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiFilm,
  FiImage,
  FiAlertTriangle
} from 'react-icons/fi';
import styles from './StepThree.module.css';
import steps from '../../styles/Steps.module.css';

// Initialize FFmpeg
const ffmpeg = new FFmpeg();

const StepThree = ({
  // Existing props
  finalJson,
  copyToClipboard,
  resetForm,
  error,
  success,
  cards,
  bodyText,
  setStep,
  templateName,

  // Step Four props (now integrated)
  phoneNumber,
  setPhoneNumber,
  sendTemplate,
  loading
}) => {
  // State
  const [activeView, setActiveView] = useState('visual');
  const [justCopied, setJustCopied] = useState({
    createTemplate: false,
    sendTemplate: false,
    builderTemplate: false
  });
  const [sendSuccess, setSendSuccess] = useState(false);

  // Add new state for send functionality
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  // Add new state for preview animation
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('mp4');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegError, setFfmpegError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({ status: 'idle', message: '' });

  // Refs
  const carouselRef = useRef(null);
  const previewFramesRef = useRef([]);

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        // Use more robust loading mechanism
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}ffmpeg-core.worker.js`, 'text/javascript')
        });
        
        console.log('FFmpeg loaded successfully');
        setFfmpegLoaded(true);
      } catch (error) {
        console.error('FFmpeg Loading Error:', error);
        setFfmpegError(error.message || 'Failed to load video generation tool');
        setFfmpegLoaded(false);
      }
    };
  
    loadFFmpeg();
  }, []);

  // Handle copy with visual feedback
  const handleCopy = (jsonType) => {
    copyToClipboard(jsonType);
    setJustCopied({
      ...justCopied,
      [jsonType]: true
    });
  
    setTimeout(() => {
      setJustCopied({
        ...justCopied,
        [jsonType]: false
      });
    }, 2000);
  };

  // Handle download JSON
  const handleDownload = (jsonType) => {
    // Verifica se há um JSON válido para download
    if (!finalJson || !finalJson[jsonType]) {
      console.error(`JSON type "${jsonType}" not available for download`);
      return;
    }
  
    try {
      // Cria um blob com o conteúdo JSON formatado
      const jsonContent = JSON.stringify(finalJson[jsonType], null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
    
      // Cria um elemento de link e ativa o download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'template'}_${jsonType}.json`;
      document.body.appendChild(link);
      link.click();
    
      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading JSON:', error);
      alert('Failed to download JSON. Please try again.');
    }
  };

  // Send template functionality
  const handleSendTemplate = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      setIsPhoneValid(false);
      setPhoneError('Please enter a valid phone number');
      return;
    }
  
    try {
      await sendTemplate();
      setSendSuccess(true);
    } catch (err) {
      console.error('Error sending template:', err);
    }
  };

  // Send another template
  const handleSendAnother = () => {
    setSendSuccess(false);
    setPhoneNumber('');
  };

  // Format phone for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 7) return phone;
  
    const countryCode = cleaned.substring(0, 2);
    const areaCode = cleaned.substring(2, 4);
    const firstPart = cleaned.substring(4, 9);
    const secondPart = cleaned.substring(9);
  
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  };

  // Capture carousel frames for animation
  const captureCarouselFrames = async () => {
    if (!carouselRef.current) {
      setDownloadStatus({ 
        status: 'error', 
        message: 'Preview container not found. Please try again.' 
      });
      return [];
    }
  
    setDownloadStatus({ status: 'capturing', message: 'Capturing frames...' });
    const frames = [];
    const numCards = cards.length;
  
    try {
      // Capture initial state
      const initialFrame = await html2canvas(carouselRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      frames.push(initialFrame);
    
      // Capture frames for each card transition
      for (let i = 1; i < numCards; i++) {
        // Wait for transition
        await new Promise(resolve => setTimeout(resolve, 100));
      
        // Capture frame
        const frame = await html2canvas(carouselRef.current, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        frames.push(frame);
      }
    
      setDownloadStatus({ status: 'processing', message: 'Processing frames...' });
      return frames;
    } catch (error) {
      console.error('Error capturing carousel frames:', error);
      setDownloadStatus({ 
        status: 'error', 
        message: 'Failed to capture frames. Please try again.' 
      });
      return [];
    }
  };

  // Generate animated preview
  const generateAnimatedPreview = async () => {
    setIsGeneratingPreview(true);
    setDownloadStatus({ status: 'starting', message: 'Starting generation...' });
  
    try {
      // Check if FFmpeg is loaded
      if (!ffmpegLoaded) {
        setDownloadStatus({ status: 'loading', message: 'Loading video tools...' });
        
        // Try to load FFmpeg again
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}ffmpeg-core.worker.js`, 'text/javascript')
        });
        
        setFfmpegLoaded(true);
      }
    
      // Capture frames
      const frames = await captureCarouselFrames();
      previewFramesRef.current = frames;
    
      if (frames.length === 0) {
        throw new Error('Failed to capture carousel frames');
      }
    
      // Generate the appropriate format
      if (previewFormat === 'gif') {
        await generateGif(frames);
      } else {
        await generateMp4(frames);
      }
    
      setDownloadStatus({ status: 'success', message: 'Download complete!' });
      
      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus({ status: 'idle', message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      setDownloadStatus({ 
        status: 'error', 
        message: `Failed to generate ${previewFormat.toUpperCase()}: ${error.message}` 
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Generate GIF from frames
  const generateGif = async (frames) => {
    try {
      setDownloadStatus({ status: 'processing', message: 'Creating GIF...' });
      
      // Create a temporary directory
      await ffmpeg.createDir('frames');
      
      // Write frames to FFmpeg virtual file system
      for (let i = 0; i < frames.length; i++) {
        setDownloadStatus({ 
          status: 'processing', 
          message: `Processing frame ${i+1}/${frames.length}...` 
        });
        
        const dataUrl = frames[i].toDataURL('image/png');
        const fileName = `frames/frame_${i.toString().padStart(3, '0')}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(dataUrl));
      }
    
      setDownloadStatus({ status: 'encoding', message: 'Encoding GIF...' });
      
      // Generate GIF using FFmpeg
      await ffmpeg.exec([
        '-framerate', '3',
        '-pattern_type', 'glob',
        '-i', 'frames/frame_*.png',
        '-vf', 'scale=400:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        'output.gif'
      ]);
    
      setDownloadStatus({ status: 'downloading', message: 'Preparing download...' });
      
      // Read the output file
      const data = await ffmpeg.readFile('output.gif');
    
      // Create download link
      const blob = new Blob([data.buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'carousel'}_preview.gif`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
    
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Error generating GIF:', error);
      throw new Error(`GIF generation failed: ${error.message}`);
    }
  };
  
  // Generate MP4 from frames
  const generateMp4 = async (frames) => {
    try {
      setDownloadStatus({ status: 'processing', message: 'Creating MP4...' });
      
      // Create a temporary directory
      await ffmpeg.createDir('frames');
      
      // Write frames to FFmpeg virtual file system
      for (let i = 0; i < frames.length; i++) {
        setDownloadStatus({ 
          status: 'processing', 
          message: `Processing frame ${i+1}/${frames.length}...` 
        });
        
        const dataUrl = frames[i].toDataURL('image/png');
        const fileName = `frames/frame_${i.toString().padStart(3, '0')}.png`;
        await ffmpeg.writeFile(fileName, await fetchFile(dataUrl));
      }
    
      setDownloadStatus({ status: 'encoding', message: 'Encoding MP4...' });
      
      // Generate MP4 using FFmpeg
      await ffmpeg.exec([
        '-framerate', '3',
        '-pattern_type', 'glob',
        '-i', 'frames/frame_*.png',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-shortest',
        'output.mp4'
      ]);
    
      setDownloadStatus({ status: 'downloading', message: 'Preparing download...' });
      
      // Read the output file
      const data = await ffmpeg.readFile('output.mp4');
    
      // Create download link
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName || 'carousel'}_preview.mp4`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
    
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Error generating MP4:', error);
      throw new Error(`MP4 generation failed: ${error.message}`);
    }
  };

  // Fallback download method (simpler version without animation)
  const handleSimpleDownload = () => {
    if (!carouselRef.current) return;
    
    setIsGeneratingPreview(true);
    setDownloadStatus({ status: 'capturing', message: 'Capturing preview...' });
    
    try {
      html2canvas(carouselRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      }).then(canvas => {
        setDownloadStatus({ status: 'downloading', message: 'Preparing download...' });
        
        // Convert to PNG and download
        const link = document.createElement('a');
        link.download = `${templateName || 'carousel'}_preview.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          setDownloadStatus({ status: 'success', message: 'Download complete!' });
          
          // Reset status after a delay
          setTimeout(() => {
            setDownloadStatus({ status: 'idle', message: '' });
          }, 3000);
        }, 100);
      });
    } catch (error) {
      console.error('Error capturing preview:', error);
      setDownloadStatus({ 
        status: 'error', 
        message: 'Failed to capture preview. Please try again.' 
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  return (
    <div className={steps.container}>
      {/* Introduction section */}
      <div className={steps.introSection}>
        <h2 className={steps.stepTitle}>Template Completed</h2>
        <p className={steps.stepDescription}>
          Your template has been created successfully. You can now preview it, get the JSON code, or send it for testing.
        </p>
      </div>
    
      {/* View tabs */}
      <div className={styles.viewTabs}>
        <button 
          className={`${styles.viewTab} ${activeView === 'visual' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('visual')}
        >
          <FiEye className={styles.tabIcon} />
          Visual Preview
        </button>
        <button 
          className={`${styles.viewTab} ${activeView === 'code' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('code')}
        >
          <FiCode className={styles.tabIcon} />
          JSON Code
        </button>
        <button 
          className={`${styles.viewTab} ${activeView === 'send' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('send')}
        >
          <FiSend className={styles.tabIcon} />
          Send Template
        </button>
      </div>
    
      {/* Content based on active tab */}
      <div className={styles.viewContent}>
        {/* Visual Preview Tab */}
        {activeView === 'visual' && (
          <div className={styles.visualPreview}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Template Preview</h3>
              <p className={styles.previewSubtitle}>This is how your carousel will appear in WhatsApp</p>
            </div>
          
            <div className={styles.previewContainer} ref={carouselRef}>
              <CarouselPreview 
                cards={cards} 
                bodyText={bodyText}
              />
            </div>
          
            <div className={styles.templateInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Template Name:</span>
                <span className={styles.infoValue}>{templateName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cards:</span>
                <span className={styles.infoValue}>{cards.length}</span>
              </div>
            </div>
          
            <div className={styles.previewActions}>
              {ffmpegError ? (
                <div className={styles.ffmpegError}>
                  <FiAlertTriangle className={styles.errorIcon} />
                  <p>Video generation tool couldn't be loaded. You can still download a static image.</p>
                  <Button 
                    variant="solid" 
                    color="primary"
                    onClick={handleSimpleDownload}
                    loading={isGeneratingPreview}
                    disabled={isGeneratingPreview}
                    iconLeft={<FiDownload />}
                  >
                    Download Static Preview
                  </Button>
                </div>
              ) : (
                <>
                  <div className={styles.formatSelector}>
                    <span className={styles.formatLabel}>Download Preview As:</span>
                    <div className={styles.formatOptions}>
                      <button 
                        className={`${styles.formatOption} ${previewFormat === 'mp4' ? styles.activeFormat : ''}`}
                        onClick={() => setPreviewFormat('mp4')}
                      >
                        <FiFilm className={styles.formatIcon} />
                        MP4 Video
                      </button>
                      <button 
                        className={`${styles.formatOption} ${previewFormat === 'gif' ? styles.activeFormat : ''}`}
                        onClick={() => setPreviewFormat('gif')}
                      >
                        <FiImage className={styles.formatIcon} />
                        GIF Animation
                      </button>
                    </div>
                  </div>
                
                  <Button 
                    variant="solid" 
                    color="primary"
                    onClick={generateAnimatedPreview}
                    loading={isGeneratingPreview}
                    disabled={isGeneratingPreview}
                    iconLeft={<FiDownload />}
                  >
                    {isGeneratingPreview ? 
                      `${downloadStatus.message || 'Processing...'}` : 
                      `Download ${previewFormat.toUpperCase()} Preview`
                    }
                  </Button>
                  
                  {downloadStatus.status === 'error' && (
                    <div className={styles.downloadError}>
                      <FiAlertTriangle className={styles.errorIcon} />
                      <p>{downloadStatus.message}</p>
                      <button 
                        className={styles.fallbackButton}
                        onClick={handleSimpleDownload}
                      >
                        Try Static Image Instead
                      </button>
                    </div>
                  )}
                  
                  {downloadStatus.status === 'success' && (
                    <div className={styles.downloadSuccess}>
                      <FiCheck className={styles.successIcon} />
                      <p>{downloadStatus.message}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      
        {/* Code View Tab - Existing functionality */}
        {activeView === 'code' && (
  <div className={styles.codeView}>
    <div className={styles.codeSection}>
      <div className={styles.codeSectionHeader}>
        <h3 className={styles.codeSectionTitle}>Template JSON para Envio</h3>
      </div>
      <div className={styles.jsonViewerWrapper}>
        <JsonViewer 
          json={finalJson.sendTemplate}
          fileName={`${templateName || 'template'}_sendTemplate.json`}
          onCopy={() => handleCopy('sendTemplate')}
          onDownload={() => handleDownload('sendTemplate')}
        />
      </div>
    </div>
    
    <div className={styles.codeSection}>
      <div className={styles.codeSectionHeader}>
        <h3 className={styles.codeSectionTitle}>Template JSON para Criação</h3>
      </div>
      <div className={styles.jsonViewerWrapper}>
        <JsonViewer 
          json={finalJson.createTemplate}
          fileName={`${templateName || 'template'}_createTemplate.json`}
          onCopy={() => handleCopy('createTemplate')}
          onDownload={() => handleDownload('createTemplate')}
        />
      </div>
    </div>
    
    {/* Novo formato para Builder Blip */}
    <div className={styles.codeSection}>
      <div className={styles.codeSectionHeader}>
        <h3 className={styles.codeSectionTitle}>JSON para Conteúdo Dinâmico (Builder Blip)</h3>
      </div>
      <div className={styles.jsonViewerWrapper}>
        <JsonViewer 
          json={finalJson.builderTemplate}
          fileName={`${templateName || 'template'}_builderTemplate.json`}
          onCopy={() => handleCopy('builderTemplate')}
          onDownload={() => handleDownload('builderTemplate')}
        />
      </div>
    </div>
  </div>
)}
      
        {/* Send Template Tab - From Step Four */}
        {activeView === 'send' && (
          <div className={styles.sendView}>
            {!sendSuccess ? (
              <div className={styles.sendForm}>
                <h3 className={styles.sendTitle}>Send Template</h3>
                <p className={styles.sendDescription}>
                  Send your template directly to a WhatsApp number to test it before submission.
                </p>
              
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>WhatsApp Number (with country code)</label>
                  <div className={styles.phoneInputWrapper}>
                    <span className={styles.phonePrefix}>+</span>
                    <input 
                      type="tel" 
                      className={`${styles.phoneInput} ${!isPhoneValid ? styles.inputError : ''}`}
                      value={phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.startsWith('+') ? e.target.value : '+' + e.target.value);
                        setIsPhoneValid(true);
                        setPhoneError('');
                      }}
                      placeholder="55219999"
                    />
                  </div>
                  {phoneError ? (
                    <p className={styles.errorText}>{phoneError}</p>
                  ) : (
                    <p className={styles.helpText}>Enter the full number with country code (e.g., 55219999)</p>
                  )}
                </div>
              
                <button 
                  className={styles.sendButton}
                  onClick={handleSendTemplate}
                  disabled={loading || !phoneNumber}
                >
                  {loading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Template
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className={styles.sendResult}>
                <div className={styles.sendSuccessIcon}>
                  <FiCheck size={48} />
                </div>
                <h3 className={styles.sendSuccessTitle}>Template Sent Successfully!</h3>
                <p className={styles.sendSuccessMessage}>
                  Your template has been sent to <strong>{formatPhoneDisplay(phoneNumber)}</strong> for testing.
                </p>
                <p className={styles.sendSuccessNote}>
                  If you don't receive the message, please ensure the number is valid and has previously messaged your WhatsApp Business account.
                </p>
              
                <div className={styles.sendResultActions}>
                  <button 
                    className={styles.sendAgainButton}
                    onClick={handleSendAnother}
                  >
                    <FiRefreshCw />
                    Send to Another Number
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    
      {/* Action buttons */}
      <div className={styles.actionButtons}>
        <button 
          className={styles.backButton}
          onClick={() => setStep(2)}
        >
          <FiChevronLeft />
          Back to Editing
        </button>
      
        <button 
          className={styles.newTemplateButton}
          onClick={resetForm}
        >
          Create New Template
        </button>
      </div>
    
      {/* Error and success messages */}
      {error && <AlertMessage error={error} />}
      {success && <AlertMessage success={success} />}
    </div>
  );
};

export default StepThree;