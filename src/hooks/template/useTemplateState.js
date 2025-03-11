// hooks/template/useTemplateState.js
import { useState, useRef } from 'react';
import { useAlertSafe } from '../common/useAlertSafe';

export const useTemplateState = () => {
  // Alert hook
  const alert = useAlertSafe();
  
  // Refs para controle
  const draftLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  
  // Estados
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  // Estados do template
  const [authKey, setAuthKey] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('pt_BR');
  const [bodyText, setBodyText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasTriedToAdvance, setHasTriedToAdvance] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Estados dos cards
  const [numCards, setNumCards] = useState(2);
  const [cards, setCards] = useState([
    createEmptyCard(),
    createEmptyCard()
  ]);
  
  // Estados de resultados
  const [uploadResults, setUploadResults] = useState([]);
  const [finalJson, setFinalJson] = useState({});

  // Função para criar um card vazio
  function createEmptyCard() {
    return {
      fileUrl: '',
      fileType: 'image',
      fileHandle: '',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: '', payload: '' }]
    };
  }

  return {
    // Alert
    alert,
    
    // Refs
    draftLoadedRef,
    autoSaveTimerRef,
    
    // Estados gerais
    step, setStep,
    loading, setLoading,
    error, setError,
    success, setSuccess,
    validationErrors, setValidationErrors,
    unsavedChanges, setUnsavedChanges,
    lastSavedTime, setLastSavedTime,
    
    // Estados do template
    authKey, setAuthKey,
    templateName, setTemplateName,
    language, setLanguage,
    bodyText, setBodyText,
    phoneNumber, setPhoneNumber,
    hasTriedToAdvance, setHasTriedToAdvance,
    hasInteracted, setHasInteracted,
    
    // Estados dos cards
    numCards, setNumCards,
    cards, setCards,
    
    // Estados de resultados
    uploadResults, setUploadResults,
    finalJson, setFinalJson,
    
    // Funções utilitárias
    createEmptyCard
  };
};