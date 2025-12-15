import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FiCopy, 
  FiDownload, 
  FiCheckCircle, 
  FiEye, 
  FiEyeOff, 
  FiMaximize, 
  FiMinimize,
  FiCode,
  FiAlertTriangle
} from 'react-icons/fi';
import styles from './JsonViewer.module.css';

function JsonViewer({ 
  json, 
  onCopy, 
  onDownload, 
  fileName = "data.json",
  collapsible = true,
  initiallyExpanded = true,
  title,
  minHeight = '20dvh',
  maxHeight = '50dvh'
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [formattedJson, setFormattedJson] = useState('');
  const [syntaxHighlighted, setSyntaxHighlighted] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(null);
  
  const containerRef = useRef(null);
  const jsonDataRef = useRef(null); // Ref para armazenar os dados JSON originais
  
  // Memoized syntax highlighting function
  const formatJsonSyntax = useMemo(() => {
    return (jsonString) => {
      if (!jsonString) return '';
      
      return jsonString
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          let cls = styles.number;
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = styles.key;
            } else {
              cls = styles.string;
            }
          } else if (/true|false/.test(match)) {
            cls = styles.boolean;
          } else if (/null/.test(match)) {
            cls = styles.null;
          }
          return `<span class="${cls}">${match}</span>`;
        });
    };
  }, []);
  
  // Format JSON with indentation
  useEffect(() => {
    if (json) {
      try {
        // Armazena os dados JSON originais em ref para uso posterior
        jsonDataRef.current = json;
        
        // Tenta formatar o JSON
        const formatted = JSON.stringify(json, null, 2);
        
        // Verifica se o JSON foi formatado corretamente (não está vazio ou truncado)
        if (!formatted || formatted === "null" || formatted === "{" || formatted === "[") {
          throw new Error("JSON inválido ou truncado");
        }
        
        setFormattedJson(formatted);
        setSyntaxHighlighted(formatJsonSyntax(formatted));
        setError(null);
      } catch (error) {
        console.error('Error formatting JSON:', error);
        setError(`Error formatting JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      setFormattedJson('');
      setSyntaxHighlighted('');
      jsonDataRef.current = null;
    }
  }, [json, formatJsonSyntax]);
  
  // Handle copy with visual feedback
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      // Garante que estamos usando o JSON mais recente
      let jsonToCopy = formattedJson;
      
      // Se o formattedJson estiver vazio ou truncado, tenta reformatar com base no ref
      if (!jsonToCopy || jsonToCopy.length < 5) {
        try {
          // Tenta usar os dados originais do JSON
          if (jsonDataRef.current) {
            jsonToCopy = JSON.stringify(jsonDataRef.current, null, 2);
          }
        } catch (err) {
          console.error('Error re-generating JSON for copy:', err);
        }
      }
      
      // Verifica novamente antes de copiar
      if (!jsonToCopy || jsonToCopy.length < 5) {
        alert('Não foi possível copiar o JSON. Os dados parecem inválidos.');
        return;
      }
      
      navigator.clipboard.writeText(jsonToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          alert('Failed to copy to clipboard. Please try again.');
        });
    }
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Garante que estamos usando o JSON mais recente para download
      let jsonToDownload = formattedJson;
      
      // Se o formattedJson estiver vazio ou truncado, tenta reformatar
      if (!jsonToDownload || jsonToDownload.length < 5) {
        try {
          if (jsonDataRef.current) {
            jsonToDownload = JSON.stringify(jsonDataRef.current, null, 2);
          }
        } catch (err) {
          console.error('Error re-generating JSON for download:', err);
        }
      }
      
      // Verifica novamente antes de fazer o download
      if (!jsonToDownload || jsonToDownload.length < 5) {
        alert('Não foi possível fazer o download do JSON. Os dados parecem inválidos.');
        return;
      }
      
      const blob = new Blob([jsonToDownload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    if (!fullscreen && !expanded) {
      setExpanded(true);
    }
  };

  // Render empty state
  if (!json) {
    return (
      <div className={styles.emptyContainer}>
        <FiCode className={styles.emptyIcon} />
        <p>No JSON data available</p>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.jsonContainer} ${fullscreen ? styles.fullscreen : ''}`}
      ref={containerRef}
      style={{ 
        maxHeight: fullscreen ? '100%' : maxHeight , minHeight
      }}
    >
      {/* Title Bar */}
      {title && (
        <div className={styles.titleBar}>
          <h4 className={styles.title}>
            <FiCode className={styles.titleIcon} />
            {title}
          </h4>
        </div>
      )}
      
      {/* Toolbar */}
      <div className={styles.toolBar}>
        {/* Collapsible Toggle */}
        {collapsible && (
          <button
            className={`${styles.toolButton} ${!expanded ? styles.collapsed : ''}`}
            onClick={toggleExpanded}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
        
        {/* Fullscreen Toggle */}
        <button
          className={`${styles.toolButton} ${fullscreen ? styles.active : ''}`}
          onClick={toggleFullscreen}
          title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <FiMinimize /> : <FiMaximize />}
        </button>
        
        {/* Copy Button */}
        <button
          className={`${styles.toolButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          title="Copy JSON"
        >
          {copied ? <FiCheckCircle className={styles.successIcon} /> : <FiCopy />}
        </button>
        
        {/* Download Button */}
        <button
          className={styles.toolButton}
          onClick={handleDownload}
          title="Download JSON"
        >
          <FiDownload />
        </button>
      </div>
      
      {/* Error Handling */}
      {error && (
        <div className={styles.errorContainer}>
          <FiAlertTriangle className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      )}
      
      {/* JSON Content */}
      {expanded && !error && (
        <div 
          className={styles.codeContainer}
          style={{ 
            maxHeight: fullscreen ? '100%' : maxHeight,
            overflowY: 'auto'
          }}
        >
          <pre 
            className={styles.jsonContent}
            dangerouslySetInnerHTML={{ __html: syntaxHighlighted }}
          ></pre>
        </div>
      )}
    </div>
  );
}

export default JsonViewer;