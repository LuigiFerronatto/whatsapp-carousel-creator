// hooks/template/useCardManagement.js - Com AlertService
import { useCallback } from 'react';
import { useAlertService } from '../common/useAlertService';

export const useCardManagement = (state) => {
  const {
    cards, setCards, numCards, setNumCards, setUnsavedChanges,
    createEmptyCard
  } = state;

  // Usar AlertService em vez de alert direto
  const alertService = useAlertService();

  // Atualizar um campo específico de um card
  const updateCard = useCallback((index, field, value) => {
    // Verificar se o índice está dentro dos limites
    if (index < 0 || index >= cards.length) {
      console.error(`Tentativa de atualizar card com índice inválido: ${index}`);
      return;
    }
    
    setCards(prevCards => {
      const newCards = [...prevCards];
      
      // Se estamos tentando alterar um card que não existe no array atual,
      // preencher o array até o índice necessário
      if (index >= newCards.length) {
        while (newCards.length <= index) {
          newCards.push(createEmptyCard());
        }
      }
      
      // Atualizar o campo específico
      newCards[index] = {
        ...newCards[index],
        [field]: value
      };
      
      return newCards;
    });
    
    // Marcar que há alterações não salvas
    setUnsavedChanges(true);
  }, [cards, setCards, setUnsavedChanges, createEmptyCard]);

  // Adicionar um novo card
  const handleAddCard = useCallback(() => {
    // Verificar se já atingimos o limite de 10 cards
    if (numCards >= 10) {
      alertService.warning('CARD_MAX_LIMIT');
      return;
    }
    
    // CORREÇÃO: Garantir que temos cards suficientes no array
    setCards(prevCards => {
      const newCards = [...prevCards];
      
      // Adicionar cards vazios se o array atual não for grande o suficiente
      while (newCards.length <= numCards) {
        newCards.push(createEmptyCard());
      }
      
      return newCards;
    });
    
    // Incrementar o número de cards
    setNumCards(prevNumCards => {
      const newNumCards = prevNumCards + 1;
      console.log(`Aumentando número de cards para ${newNumCards}`);
      alertService.info('CARD_ADDED');
      return newNumCards;
    });
    
    // Marcar que há alterações não salvas
    setUnsavedChanges(true);
  }, [numCards, setNumCards, setCards, setUnsavedChanges, createEmptyCard, alertService]);

  // Remover um card
  const handleRemoveCard = useCallback(() => {
    // Verificar se estamos no limite mínimo de 2 cards
    if (numCards <= 2) {
      alertService.warning('CARD_MIN_LIMIT');
      return;
    }
    
    // CORREÇÃO: Não removemos realmente o card do array, apenas diminuímos o numCards
    // Isso mantém os dados dos cards anteriores disponíveis caso o usuário queira readicioná-los
    setNumCards(prevNumCards => {
      const newNumCards = prevNumCards - 1;
      console.log(`Diminuindo número de cards para ${newNumCards}`);
      alertService.info('CARD_REMOVED');
      return newNumCards;
    });
    
    // Marcar que há alterações não salvas
    setUnsavedChanges(true);
  }, [numCards, setNumCards, setUnsavedChanges, alertService]);

  return {
    updateCard,
    handleAddCard,
    handleRemoveCard
  };
};