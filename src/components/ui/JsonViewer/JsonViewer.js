// components/common/JsonViewer.js
import React, { useState, useEffect } from 'react';
import { FiCopy, FiDownload, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './JsonViewer.module.css';

/**
 * JsonViewer component for displaying and interacting with JSON data
 * @param {Object} props - Component properties
 * @param {Object} props.json - The JSON object to display
 * @param {Function} props.onCopy - Function to call when the copy button is clicked
 * @param {Function} props.onDownload - Function to call when the download button is clicked
 * @param {string} props.fileName - Name for the downloaded file (default: "data.json")
 * @param {boolean} props.collapsible - Whether the viewer is collapsible (default: false)
 * @param {boolean} props.initiallyExpanded - Whether the viewer is initially expanded if collapsible (default: true)
 * @param {string} props.title - Optional title for the JSON viewer
 * @returns {JSX.Element|null} JSON viewer component or null if no JSON
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
  
  // Format JSON with proper indentation and highlighting
  useEffect(() => {
    if (json) {
      try {
        const formatted = JSON.stringify(json, null, 2);
        setFormattedJson(formatted);
      } catch (error) {
        console.error('Error formatting JSON:', error);
        setFormattedJson(JSON.stringify(json));
      }
    }
  }, [json]);

  // If no JSON provided, show empty state
  if (!json) {
    return (
      <div className={styles.emptyContainer}>
        JSON not available
      </div>
    );
  }

  // Handle copy with feedback
  const handleCopy = () => {
    // If custom copy handler provided, use it
    if (onCopy) {
      onCopy();
    } else {
      // Otherwise, copy to clipboard directly
      navigator.clipboard.writeText(formattedJson)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
        });
    }
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Create a blob and download it
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

  // Toggle expanded state
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
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
        
        <button
          className={styles.toolButton}
          onClick={handleCopy}
          title="Copy JSON"
        >
          {copied ? <FiCheckCircle className={styles.successIcon} /> : <FiCopy />}
        </button>
        
        <button
          className={styles.toolButton}
          onClick={handleDownload}
          title="Download JSON"
        >
          <FiDownload />
        </button>
      </div>
      
      {expanded && (
        <pre className={styles.jsonContent}>
          {formattedJson}
        </pre>
      )}
    </div>
  );
};

export default JsonViewer;