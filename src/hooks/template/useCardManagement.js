// hooks/template/useCardManagement.js
import { useCallback } from 'react';

export const useCardManagement = (state) => {
  const {
    cards, setCards,
    numCards, setNumCards,
    setUnsavedChanges,
    validationErrors, setValidationErrors,
    alert
  } = state;

  // Adicionar um novo card
  const handleAddCard = useCallback(() => {
    if (numCards < 10) {
      setNumCards(prev => prev + 1);
      setCards(prev => [...prev, state.createEmptyCard()]);
      
      // Marcar alterações não salvas
      setUnsavedChanges(true);
      
      // Mostrar alerta
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Card ${numCards + 1} adicionado ao carrossel`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    } else {
      // Mostrar alerta de limite máximo
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Limite máximo de 10 cards atingido', {
            position: 'top-center'
          });
        }
      }, 0);
    }
  }, [numCards, setNumCards, setCards, state.createEmptyCard, setUnsavedChanges, alert]);
  
  // Remover o último card
  const handleRemoveCard = useCallback(() => {
    if (numCards > 2) {
      setNumCards(prev => prev - 1);
      
      // Não remover o card do array, apenas diminuir o número de cards visíveis
      // Isso permite recuperar o card se o usuário mudar de ideia
      
      // Marcar alterações não salvas
      setUnsavedChanges(true);
      
      // Mostrar alerta
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Card ${numCards} removido do carrossel`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    } else {
      // Mostrar alerta de limite mínimo
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Um carrossel precisa ter no mínimo 2 cards', {
            position: 'top-center'
          });
        }
      }, 0);
    }
  }, [numCards, setNumCards, setUnsavedChanges, alert]);
  
  // Atualizar um campo específico de um card
  const updateCard = useCallback((index, field, value) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Se o índice é válido
      if (index >= 0 && index < newCards.length) {
        // Cria uma cópia do card para modificação
        newCards[index] = { ...newCards[index], [field]: value };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[`card_${index}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`card_${index}_${field}`];
        return newErrors;
      });
    }
  }, [setCards, setUnsavedChanges, validationErrors, setValidationErrors]);

  return {
    handleAddCard,
    handleRemoveCard,
    updateCard
  };
};