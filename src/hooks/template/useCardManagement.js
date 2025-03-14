// hooks/template/useCardManagement.js
import { useCallback } from 'react';
import { useAlertService } from '../common/useAlertService';

/**
 * Hook for managing carousel cards
 * 
 * @param {Object} state - Template state from useTemplateState hook
 * @returns {Object} Card management methods and state
 */
export const useCardManagement = (state) => {
  const {
    cards, setCards, numCards, setNumCards, setUnsavedChanges,
    createEmptyCard
  } = state;

  // Use AlertService instead of direct alerts
  const alertService = useAlertService();

  /**
   * Update a specific field of a card
   * 
   * @param {number} index - Index of the card to update
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const updateCard = useCallback((index, field, value) => {
    // Check if index is within bounds
    if (index < 0 || index >= cards.length) {
      console.error(`Attempted to update card with invalid index: ${index}`);
      return;
    }
    
    setCards(prevCards => {
      const newCards = [...prevCards];
      
      // If we're trying to update a card that doesn't exist in the current array,
      // fill the array up to the necessary index
      if (index >= newCards.length) {
        while (newCards.length <= index) {
          newCards.push(createEmptyCard());
        }
      }
      
      // Update the specific field
      newCards[index] = {
        ...newCards[index],
        [field]: value
      };
      
      return newCards;
    });
    
    // Mark that there are unsaved changes
    setUnsavedChanges(true);
  }, [cards, setCards, setUnsavedChanges, createEmptyCard]);

  /**
   * Add a new card to the carousel
   */
  const handleAddCard = useCallback(() => {
    // Check if we've already reached the limit of 10 cards
    if (numCards >= 10) {
      alertService.warning('Maximum limit of 10 cards reached.', {
        position: 'top-center',
        autoCloseTime: 3000
      });
      return;
    }
    
    // Ensure we have enough cards in the array
    setCards(prevCards => {
      const newCards = [...prevCards];
      
      // Add empty cards if the current array isn't large enough
      while (newCards.length <= numCards) {
        newCards.push(createEmptyCard());
      }
      
      return newCards;
    });
    
    // Increment the number of cards
    setNumCards(prevNumCards => {
      const newNumCards = prevNumCards + 1;
      console.log(`Increasing number of cards to ${newNumCards}`);
      alertService.info('Card added successfully.', {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      return newNumCards;
    });
    
    // Mark that there are unsaved changes
    setUnsavedChanges(true);
  }, [numCards, setNumCards, setCards, setUnsavedChanges, createEmptyCard, alertService]);

  /**
   * Remove the last card from the carousel
   */
  const handleRemoveCard = useCallback(() => {
    // Check if we're at the minimum limit of 2 cards
    if (numCards <= 2) {
      alertService.warning('Minimum of 2 cards required.', {
        position: 'top-center',
        autoCloseTime: 3000
      });
      return;
    }
    
    // We don't actually remove the card from the array, just decrease numCards
    // This keeps the data of previous cards available in case the user wants to add them back
    setNumCards(prevNumCards => {
      const newNumCards = prevNumCards - 1;
      console.log(`Decreasing number of cards to ${newNumCards}`);
      alertService.info('Card removed.', {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
      return newNumCards;
    });
    
    // Mark that there are unsaved changes
    setUnsavedChanges(true);
  }, [numCards, setNumCards, setUnsavedChanges, alertService]);

  return {
    updateCard,
    handleAddCard,
    handleRemoveCard
  };
};