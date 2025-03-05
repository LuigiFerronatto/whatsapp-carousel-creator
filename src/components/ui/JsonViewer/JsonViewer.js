// components/ui/JsonViewer/JsonViewer.js
import React, { useState, useEffect } from 'react';
import { FiCopy, FiDownload, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './JsonViewer.module.css';

/**
 * JsonViewer component para visualização interativa de JSON
 * Com funcionalidades de cópia, download e código formatado
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.json - O objeto JSON a ser exibido
 * @param {Function} props.onCopy - Função para cópia (opcional)
 * @param {Function} props.onDownload - Função para download (opcional)
 * @param {string} props.fileName - Nome do arquivo (default: "data.json")
 * @param {boolean} props.collapsible - Se é expansível/recolhível (default: false)
 * @param {boolean} props.initiallyExpanded - Se inicia expandido (default: true)
 * @param {string} props.title - Título opcional para o visualizador
 * @returns {JSX.Element|null} Componente de visualização do JSON
 */
const JsonViewer = ({ 
  json, 
  onCopy, 
  onDownload, 
  fileName = "data.json",
  collapsible = false,
  initiallyExpanded = true,
  title
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [formattedJson, setFormattedJson] = useState('');
  const [syntaxHighlighted, setSyntaxHighlighted] = useState('');
  
  // Formatar JSON com indentação
  useEffect(() => {
    if (json) {
      try {
        const formatted = JSON.stringify(json, null, 2);
        setFormattedJson(formatted);
        
        // Aplicar highlight de sintaxe básico
        const highlighted = formatJsonSyntax(formatted);
        setSyntaxHighlighted(highlighted);
      } catch (error) {
        console.error('Erro ao formatar JSON:', error);
        setFormattedJson(JSON.stringify(json));
        setSyntaxHighlighted(JSON.stringify(json));
      }
    }
  }, [json]);

  // Se não há JSON, mostrar estado vazio
  if (!json) {
    return (
      <div className={styles.emptyContainer}>
        JSON não disponível
      </div>
    );
  }

  // Função simples para highlight de sintaxe
  function formatJsonSyntax(jsonString) {
    return jsonString
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = styles.number;
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = styles.key;
            match = match.replace(/:/g, '');
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
  }

  // Manipular cópia com feedback visual
  const handleCopy = () => {
    // Se uma função de cópia personalizada foi fornecida, usá-la
    if (onCopy) {
      onCopy();
    } else {
      // Caso contrário, copiar diretamente para o clipboard
      navigator.clipboard.writeText(formattedJson)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Erro ao copiar para clipboard:', err);
        });
    }
  };

  // Manipular download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Criar um blob e download
      const blob = new Blob([formattedJson], { type: 'application/json' });
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

  // Alternar estado expandido
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={styles.jsonContainer}>
      {title && (
        <div className={styles.titleBar}>
          <h4 className={styles.title}>{title}</h4>
        </div>
      )}
      
      <div className={styles.toolBar}>
        {collapsible && (
          <button
            className={styles.toolButton}
            onClick={toggleExpanded}
            title={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
        
        <button
          className={styles.toolButton}
          onClick={handleCopy}
          title="Copiar JSON"
        >
          {copied ? <FiCheckCircle className={styles.successIcon} /> : <FiCopy />}
        </button>
        
        <button
          className={styles.toolButton}
          onClick={handleDownload}
          title="Baixar JSON"
        >
          <FiDownload />
        </button>
      </div>
      
      {expanded && (
        <div className={styles.codeContainer}>
          <pre 
            className={styles.jsonContent}
            dangerouslySetInnerHTML={{ __html: syntaxHighlighted }}
          ></pre>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;