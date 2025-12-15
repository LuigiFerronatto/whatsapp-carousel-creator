// hooks/template/useButtonManagement.js
import { useCallback } from 'react';

/**
 * Hook for managing WhatsApp template buttons across cards
 * 
 * @param {Object} state - Template state from useTemplateState hook
 * @param {Object} cardManagement - Card management methods from useCardManagement hook
 * @returns {Object} Button management methods
 */
export const useButtonManagement = (state, cardManagement) => {
  const {
    cards, setCards,
    numCards,
    setUnsavedChanges,
    alert
  } = state;

  /**
   * Check button consistency across all cards
   * 
   * @returns {Object} Consistency status and message
   */
  const checkButtonConsistency = useCallback(() => {
    // If there's only one card, it's already consistent
    if (numCards <= 1) {
      return { isConsistent: true, message: "Consistent" };
    }
    
    // Use the first card as reference
    const referenceButtons = cards[0]?.buttons || [];
    
    // Safety check if first card doesn't have buttons
    if (!referenceButtons.length) {
      return { isConsistent: true, message: "No buttons to check" };
    }

    const referenceCount = referenceButtons.length;
    const referenceTypes = referenceButtons.map(button => button.type);
    
    // Check all cards
    let allSameCount = true;
    let allSameTypes = true;
    
    for (let i = 1; i < numCards; i++) {
      // Safety check for invalid cards
      if (!cards[i] || !Array.isArray(cards[i].buttons)) {
        continue;
      }
      
      // Check button count
      if (cards[i].buttons.length !== referenceCount) {
        allSameCount = false;
      }
      
      // Check button types
      for (let j = 0; j < Math.min(cards[i].buttons.length, referenceCount); j++) {
        if (cards[i].buttons[j].type !== referenceTypes[j]) {
          allSameTypes = false;
        }
      }
    }
    
    // Determine overall status
    const isConsistent = allSameCount && allSameTypes;
    
    // Mensagem simplificada
    let message = isConsistent 
      ? "Consistente: Todos os cartões têm a mesma configuração de botões."
      : "Inconsistente: ";
      
    if (!allSameCount) {
      message += "Alguns cartões têm quantidades diferentes de botões. ";
    }
    
    if (!allSameTypes) {
      message += "Alguns cartões têm tipos diferentes de botões. ";
    }
    
    return {
      isConsistent,
      message,
      allSameCount,
      allSameTypes
    };
  }, [cards, numCards]);

  /**
   * Standardize buttons across all cards using the first card as a template
   */
  const applyButtonStandardization = useCallback(() => {
    // If there's only one card, no need to standardize
    if (numCards <= 1) {
      return;
    }
    
    // Safety check - ensure cards array and first card exist
    if (!Array.isArray(cards) || cards.length === 0 || !cards[0]) {
      console.warn("Cannot standardize buttons: Invalid cards data");
      return;
    }
    
    // Copy buttons from the first card as a template
    const templateButtons = cards[0].buttons || [];
    
    // Update all other cards
    const newCards = [...cards];
    
    for (let i = 1; i < numCards; i++) {
      // Skip invalid card entries
      if (!newCards[i]) continue;
      
      const newButtons = [];
      
      // Create new buttons based on the template
      for (let j = 0; j < templateButtons.length; j++) {
        const templateButton = templateButtons[j];
        
        // Safety check - ensure current card has buttons array
        if (!Array.isArray(newCards[i].buttons)) {
          newCards[i].buttons = [];
        }
        
        if (j < newCards[i].buttons.length) {
          // Keep existing button data, but update the type
          newButtons.push({
            ...newCards[i].buttons[j],
            type: templateButton.type,
            // Ensure type-specific fields
            ...(templateButton.type === 'URL' && !newCards[i].buttons[j].url ? { url: '' } : {}),
            ...(templateButton.type === 'PHONE_NUMBER' && !newCards[i].buttons[j].phoneNumber ? { phoneNumber: '' } : {})
          });
        } else {
          // Add a new button based on the template
          newButtons.push({
            type: templateButton.type,
            text: '',
            ...(templateButton.type === 'URL' ? { url: '' } : {}),
            ...(templateButton.type === 'PHONE_NUMBER' ? { phoneNumber: '' } : {})
          });
        }
      }
      
      // Update the card
      newCards[i] = { ...newCards[i], buttons: newButtons };
    }
    
    // Update state
    setCards(newCards);
    setUnsavedChanges(true);
    
    // Notify the user
    if (alert && typeof alert.success === 'function') {
      alert.success("Buttons standardized successfully!", {
        position: 'bottom-right',
        autoCloseTime: 3000
      });
    }
  }, [cards, numCards, setCards, setUnsavedChanges, alert]);

  /**
   * Synchronize button type across all cards
   * 
   * @param {number} buttonIndex - Index of the button to update
   * @param {string} newType - New button type
   */
  const syncButtonType = useCallback((buttonIndex, newType) => {
    // Safety check
    if (!Array.isArray(cards) || cards.length === 0) {
      console.warn("Cannot sync button types: Invalid cards data");
      return;
    }
    
    try {
      const newCards = [...cards];
      
      // Update type across all cards
      for (let i = 0; i < numCards; i++) {
        // Skip invalid card entries
        if (!newCards[i]) continue;
        
        // Ensure buttons array exists
        if (!Array.isArray(newCards[i].buttons)) {
          newCards[i].buttons = [];
        }
        
        if (newCards[i].buttons.length > buttonIndex) {
          const buttonsCopy = [...newCards[i].buttons];
          
          buttonsCopy[buttonIndex] = {
            ...buttonsCopy[buttonIndex],
            type: newType,
            // Add type-specific fields if needed
            ...(newType === 'URL' && !buttonsCopy[buttonIndex].url ? { url: '' } : {}),
            ...(newType === 'PHONE_NUMBER' && !buttonsCopy[buttonIndex].phoneNumber ? { phoneNumber: '' } : {})
          };
          
          newCards[i] = { ...newCards[i], buttons: buttonsCopy };
        }
      }
      
      // Update state
      setCards(newCards);
      setUnsavedChanges(true);
      
      // Notify the user
      if (alert && typeof alert.info === 'function') {
        alert.info(`Button type synchronized across all cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    } catch (error) {
      console.error("Error in syncButtonType:", error);
      
      // Show error message
      if (alert && typeof alert.error === 'function') {
        alert.error("Failed to synchronize button type", {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }
    }
  }, [cards, numCards, setCards, setUnsavedChanges, alert]);

  /**
   * Synchronize button addition across all cards
   * 
   * @param {number} sourceCardIndex - Index of the source card
   * @param {string} buttonType - Type of button to add (default: 'QUICK_REPLY')
   */
  const syncAddButton = useCallback((sourceCardIndex, buttonType = 'QUICK_REPLY') => {
    // Safety check
    if (!Array.isArray(cards) || cards.length === 0) {
      console.warn("Cannot sync add button: Invalid cards data");
      return;
    }
    
    try {
      // Create new button
      const newButton = { 
        type: buttonType, 
        text: '',
        ...(buttonType === 'URL' ? { url: '' } : {}),
        ...(buttonType === 'PHONE_NUMBER' ? { phoneNumber: '' } : {})
      };
      
      // Add to all cards
      const newCards = [...cards];
      
      for (let i = 0; i < numCards; i++) {
        // Skip invalid card entries
        if (!newCards[i]) continue;
        
        // Ensure source card index is valid
        if (i !== sourceCardIndex) {
          // Ensure buttons array exists
          if (!Array.isArray(newCards[i].buttons)) {
            newCards[i].buttons = [];
          }
          
          newCards[i] = { 
            ...newCards[i], 
            buttons: [...newCards[i].buttons, newButton] 
          };
        }
      }
      
      // Update state
      setCards(newCards);
      setUnsavedChanges(true);
      
      // Notify the user
      if (alert && typeof alert.info === 'function') {
        alert.info("Button added to all cards", {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    } catch (error) {
      console.error("Error in syncAddButton:", error);
      
      // Show error message
      if (alert && typeof alert.error === 'function') {
        alert.error("Failed to add button to all cards", {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }
    }
  }, [cards, numCards, setCards, setUnsavedChanges, alert]);

  /**
   * Synchronize button removal across all cards
   * 
   * @param {number} buttonIndex - Index of the button to remove
   */
  const syncRemoveButton = useCallback((buttonIndex) => {
    // Safety check
    if (!Array.isArray(cards) || cards.length === 0) {
      console.warn("Cannot sync remove button: Invalid cards data");
      return;
    }
    
    try {
      // Remove button from all cards
      const newCards = [...cards];
      
      for (let i = 0; i < numCards; i++) {
        // Skip invalid card entries
        if (!newCards[i]) continue;
        
        // Ensure buttons array exists
        if (!Array.isArray(newCards[i].buttons)) {
          newCards[i].buttons = [];
          continue;
        }
        
        newCards[i] = {
          ...newCards[i],
          buttons: newCards[i].buttons.filter((_, idx) => idx !== buttonIndex)
        };
      }
      
      // Update state
      setCards(newCards);
      setUnsavedChanges(true);
      
      // Notify the user
      if (alert && typeof alert.info === 'function') {
        alert.info("Button removed from all cards", {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    } catch (error) {
      console.error("Error in syncRemoveButton:", error);
      
      // Show error message
      if (alert && typeof alert.error === 'function') {
        alert.error("Failed to remove button from all cards", {
          position: 'top-center',
          autoCloseTime: 5000
        });
      }
    }
  }, [cards, numCards, setCards, setUnsavedChanges, alert]);

  return {
    checkButtonConsistency,
    applyButtonStandardization,
    syncButtonType,
    syncAddButton,
    syncRemoveButton
  };
};