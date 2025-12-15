// hooks/template/useWhatsAppTemplate.js
import { useTemplateState } from './useTemplateState';
import { useCardManagement } from './useCardManagement';
import { useButtonManagement } from './useButtonManagement';
import { useValidation } from '../common/useValidation';
import { useDraftManager } from './useDraftManager';
import { useTemplatePersistence } from './useTemplatePersistence';
import { useStepsValidation } from './useStepsValidation';
import { useEffect, useRef } from 'react';

/**
 * Main hook that combines all template-related functionality
 * 
 * @returns {Object} Consolidated template state and methods
 */
export const useWhatsAppTemplate = () => {
  // Base state
  const state = useTemplateState();
  
  // Card management
  const cardManagement = useCardManagement(state);
  
  // Validation
  const validation = useValidation(state);
  
  // Draft management
  const draftManager = useDraftManager(state);
  
  // Button management
  const buttonManagement = useButtonManagement(state, cardManagement);
  
  // Template persistence
  const templatePersistence = useTemplatePersistence(state, validation, draftManager, cardManagement);
  
  // Step validation
  const stepsValidation = useStepsValidation(state, validation, draftManager);

  // Add a ref to track if we've already saved for the current step
  // This helps prevent infinite save loops
  const savedForStepRef = useRef({});

  /**
   * Clear error and success messages
   */
  const clearMessages = () => {
    state.setError('');
    state.setSuccess('');
  };

  /**
   * Reset the form to create a new template
   */
  const resetForm = () => {
    // Confirm before resetting
    if (window.confirm('Are you sure you want to create a new template? Current data will be lost.')) {
      // Clear saved draft first
      draftManager.clearDraft();
      
      // Reset all states
      state.setStep(1);
      state.setCards(Array(2).fill().map(() => state.createEmptyCard()));
      state.setNumCards(2);
      state.setTemplateName('');
      state.setBodyText('');
      state.setAuthKey('');
      state.setFinalJson({});
      state.setPhoneNumber('');
      state.setError('');
      state.setSuccess('');
      state.setValidationErrors({});
      state.setLastSavedTime(null);
      state.setUnsavedChanges(false);
      state.setUploadResults([]);
      state.setHasTriedToAdvance(false);
      
      // Reset draft loading control ref
      state.draftLoadedRef.current = false;
      
      // Reset our save tracking ref
      savedForStepRef.current = {};
      
      // Show reset alert
      setTimeout(() => {
        if (state.alert && typeof state.alert.info === 'function') {
          state.alert.info('Template reset. You can start a new template now.', {
            position: 'top-right',
            autoCloseTime: 3000
          });
        }
      }, 0);
    }
  };

  // Fixed effect to prevent infinite loop
  useEffect(() => {
    // Only save if we're on step 2 AND we haven't saved for this step transition yet
    // AND there are fileHandles to preserve
    if (
      state.step === 2 && 
      !savedForStepRef.current[state.step] && 
      state.cards.some(card => card.fileHandle)
    ) {
      // Mark this step as saved
      savedForStepRef.current[state.step] = true;
      
      // Now save state
      draftManager.saveCurrentState();
      console.log('State saved when advancing to step 2, fileHandles preserved');
    }
    
    // Reset the saved flag when step changes
    if (savedForStepRef.current[state.step] && state.step !== 2) {
      savedForStepRef.current[state.step] = false;
    }
  }, [state.step]);

  return {
    // Template state
    ...state,
    
    // Card management
    ...cardManagement,
    
    // Button management
    ...buttonManagement,
    
    // Validation
    ...validation,
    
    // Draft management
    ...draftManager,
    
    // Template persistence
    ...templatePersistence,
    
    // Step validation
    ...stepsValidation,
    
    // Utility functions
    clearMessages,
    resetForm
  };
};