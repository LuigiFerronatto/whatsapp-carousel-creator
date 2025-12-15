// components/TextFormatter/TextFormatter.js
import React, { useState, useEffect } from 'react';
import { 
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiHash,
  FiCornerUpRight,
  FiType,
  FiAlignLeft,
  FiHelpCircle
} from 'react-icons/fi';
import { RiListOrdered, RiQuoteText } from 'react-icons/ri';
import styles from './TextFormatter.module.css';

/**
 * Barra de ferramentas de formatação de texto
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onChange - Função chamada quando o texto é formatado
 * @param {string} props.value - Valor atual do texto
 * @param {React.RefObject} props.inputRef - Referência para o elemento de input/textarea
 * @param {boolean} props.compact - Utilizar layout compacto
 * @param {boolean} props.darkMode - Utilizar tema escuro
 * @param {boolean} props.showHint - Mostrar dica de formatação
 * @returns {JSX.Element} Componente de formatação de texto
 */
const TextFormatter = ({ 
  onChange,
  value = '',
  inputRef,
  compact = false,
  darkMode = false,
  showHint = true
}) => {
  const [showHintContent, setShowHintContent] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Detecta se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Função que aplica a formatação ao texto
  const applyFormatting = (format) => {
    if (!inputRef || !inputRef.current) return;

    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let newPosition = end;

    // Mostra feedback visual temporário
    setActiveFormat(format);
    setTimeout(() => setActiveFormat(null), 300);

    switch (format) {
      case 'bold':
        newText = newText.substring(0, start) + '*' + selectedText + '*' + newText.substring(end);
        newPosition = end + 4;
        break;
      case 'italic':
        newText = newText.substring(0, start) + '_' + selectedText + '_' + newText.substring(end);
        newPosition = end + 2;
        break;
      case 'strikethrough':
        newText = newText.substring(0, start) + '~' + selectedText + '~' + newText.substring(end);
        newPosition = end + 4;
        break;
      case 'code':
        newText = newText.substring(0, start) + '`' + selectedText + '`' + newText.substring(end);
        newPosition = end + 7;
        break;
      case 'bullet':
        // Adiciona lista com marcadores
        const bulletText = selectedText ? 
          selectedText.split('\n').map(line => `* ${line}`).join('\n') :
          '* ';
        newText = newText.substring(0, start) + bulletText + newText.substring(end);
        newPosition = start + bulletText.length;
        break;
      case 'numbered':
        // Adiciona lista numerada
        const numberedText = selectedText ? 
          selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') :
          '1. ';
        newText = newText.substring(0, start) + numberedText + newText.substring(end);
        newPosition = start + numberedText.length;
        break;
      case 'quote':
        // Adiciona citação
        const quoteText = selectedText ? 
          selectedText.split('\n').map(line => `> ${line}`).join('\n') :
          '> ';
        newText = newText.substring(0, start) + quoteText + newText.substring(end);
        newPosition = start + quoteText.length;
        break;
      case 'newline':
        newText = newText.substring(0, start) + '\n' + newText.substring(end);
        newPosition = start + 1;
        break;
      default:
        break;
    }

    // Chama o callback onChange com o novo texto
    if (onChange) {
      const syntheticEvent = {
        target: { value: newText },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      onChange(syntheticEvent);
    }

    // Reposiciona o cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Renderiza um botão de formatação
  const renderFormatButton = (format, icon, label) => {
    const isActive = activeFormat === format;
    
    return (
      <button 
        type="button"
        className={`${styles.formatButton} ${isActive ? styles.active : ''}`}
        onClick={() => applyFormatting(format)}
        aria-label={label}
        title={label}
      >
        {icon}
        {!compact && !isMobile && <span className={styles.buttonLabel}>{label}</span>}
      </button>
    );
  };

  // Grupo principal de botões (sempre visíveis)
  const primaryButtons = (
    <>
      {renderFormatButton('bold', <FiBold size={compact ? 14 : 16} />, 'Negrito')}
      {renderFormatButton('italic', <FiItalic size={compact ? 14 : 16} />, 'Itálico')}
      {renderFormatButton('strikethrough', <span className={styles.strikethrough}>S</span>, 'Tachado')}
    </>
  );

  // Grupo secundário de botões (expandido ou em menu)
  const secondaryButtons = (
    <>
      {renderFormatButton('code', <FiCode size={compact ? 14 : 16} />, 'Bloco de código')}
      {renderFormatButton('numbered', <RiListOrdered size={compact ? 14 : 16} />, 'Lista numerada')}
      {renderFormatButton('bullet', <FiList size={compact ? 14 : 16} />, 'Lista')}
      {renderFormatButton('quote', <RiQuoteText size={compact ? 14 : 16} />, 'Citação')}
    </>
  );

  return (
    <div className={`${styles.formattingToolbar} ${compact ? styles.compact : ''} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.toolbarGroup}>
        {primaryButtons}
        
        {isMobile ? (
          <div className={styles.moreOptionsWrapper}>
            <button 
              type="button"
              className={`${styles.formatButton} ${styles.moreButton}`}
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              aria-expanded={showMoreOptions}
              aria-label="Mais opções"
            >
              <FiAlignLeft size={compact ? 14 : 16} />
              <span className={styles.buttonLabel}>Mais</span>
            </button>
            
            {showMoreOptions && (
              <div className={styles.moreOptionsMenu}>
                {secondaryButtons}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={styles.divider}></div>
            {secondaryButtons}
          </>
        )}
      </div>
      
      {showHint && (
        <div className={styles.formatHint}>
          <button 
            className={styles.helpButton} 
            aria-label="Ajuda de formatação"
            onClick={() => setShowHintContent(!showHintContent)}
            onMouseEnter={() => setShowHintContent(true)}
            onMouseLeave={() => setShowHintContent(false)}
          >
            <FiHelpCircle size={16} />
          </button>
          
          {showHintContent && (
            <div 
              className={styles.formatHintContent}
              role="tooltip"
            >
              <h4>Formatação de Texto</h4>
              <div className={styles.hintGrid}>
                <div className={styles.hintItem}>
                  <strong>Negrito</strong>
                  <code>**texto**</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Itálico</strong>
                  <code>_texto_</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Tachado</strong>
                  <code>~~texto~~</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Lista</strong>
                  <code>* item</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Lista numerada</strong>
                  <code>1. item</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Citação</strong>
                  <code>&gt; texto</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Código inline</strong>
                  <code>`código`</code>
                </div>
                <div className={styles.hintItem}>
                  <strong>Bloco de código</strong>
                  <code>`código`</code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextFormatter;


// // Inserir formatação no texto selecionado
// const insertFormatting = (format) => {
//     if (!textareaRef.current) return;

//     const start = textareaRef.current.selectionStart;
//     const end = textareaRef.current.selectionEnd;
//     const selectedText = card.bodyText ? card.bodyText.substring(start, end) : '';
//     let newText = card.bodyText || '';
//     let newPosition = end;

//     switch (format) {
//       case 'bold':
//         newText = newText.substring(0, start) + '*' + selectedText + '*' + newText.substring(end);
//         newPosition = end + 2;
//         break;
//       case 'italic':
//         newText = newText.substring(0, start) + '_' + selectedText + '_' + newText.substring(end);
//         newPosition = end + 2;
//         break;
//       case 'strikethrough':
//         newText = newText.substring(0, start) + '~' + selectedText + '~' + newText.substring(end);
//         newPosition = end + 2;
//         break;
//       case 'code':
//         newText = newText.substring(0, start) + '```' + selectedText + '```' + newText.substring(end);
//         newPosition = end + 6;
//         break;
//       case 'bullet':
//         // Adiciona lista com marcadores
//         const bulletText = selectedText ? 
//           selectedText.split('\n').map(line => `* ${line}`).join('\n') :
//           '* ';
//         newText = newText.substring(0, start) + bulletText + newText.substring(end);
//         newPosition = start + bulletText.length;
//         break;
//       case 'numbered':
//         // Adiciona lista numerada
//         const numberedText = selectedText ? 
//           selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') :
//           '1. ';
//         newText = newText.substring(0, start) + numberedText + newText.substring(end);
//         newPosition = start + numberedText.length;
//         break;
//       case 'quote':
//         // Adiciona citação
//         const quoteText = selectedText ? 
//           selectedText.split('\n').map(line => `> ${line}`).join('\n') :
//           '> ';
//         newText = newText.substring(0, start) + quoteText + newText.substring(end);
//         newPosition = start + quoteText.length;
//         break;
//       case 'inline-code':
//         // Código inline
//         newText = newText.substring(0, start) + '`' + selectedText + '`' + newText.substring(end);
//         newPosition = end + 2;
//         break;
//       case 'newline':
//         newText = newText.substring(0, start) + '\n' + newText.substring(end);
//         newPosition = start + 1;
//         break;
//       default:
//         break;
//     }

//     updateCard(index, 'bodyText', newText);
//     if (!changedFields.includes('bodyText')) {
//       setChangedFields(prev => [...prev, 'bodyText']);
//     }

//     // Reposiciona o cursor
//     setTimeout(() => {
//       if (textareaRef.current) {
//         textareaRef.current.focus();
//         textareaRef.current.setSelectionRange(newPosition, newPosition);
//       }
//     }, 0);
//   };