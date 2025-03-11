// hooks/template/useButtonManagement.js
import { useCallback } from 'react';

export const useButtonManagement = (state, cardManagement) => {
  const {
    cards, setCards,
    numCards,
    setUnsavedChanges,
    validationErrors, setValidationErrors,
    alert
  } = state;

  const { updateCard } = cardManagement;

  // Verificar consistência dos botões entre todos os cards
  const checkButtonConsistency = useCallback(() => {
    const activeCards = cards.slice(0, numCards);
    
    // Consistente se houver apenas um card
    if (activeCards.length <= 1) {
      return { 
        isConsistent: true,
        message: "Consistente: Apenas um card no carrossel."
      };
    }
    
    // Coletar informações do primeiro card como referência
    const referenceButtons = activeCards[0].buttons;
    const referenceCount = referenceButtons.length;
    const referenceTypes = referenceButtons.map(button => button.type);
    
    // Verificar consistência em todos os cards
    let allSameCount = true;
    let allSameTypes = true;
    let inconsistentCards = [];
    
    activeCards.forEach((card, index) => {
      if (index === 0) return; // Pular o primeiro card (referência)
      
      // Verificar quantidade de botões
      if (card.buttons.length !== referenceCount) {
        allSameCount = false;
        inconsistentCards.push({
          cardIndex: index,
          issue: `Quantidade diferente de botões: ${card.buttons.length} vs ${referenceCount}`
        });
      }
      
      // Verificar tipos de botões se a quantidade for a mesma
      if (card.buttons.length === referenceCount) {
        for (let i = 0; i < referenceCount; i++) {
          if (card.buttons[i].type !== referenceTypes[i]) {
            allSameTypes = false;
            inconsistentCards.push({
              cardIndex: index,
              buttonIndex: i,
              issue: `Tipo de botão diferente: ${card.buttons[i].type} vs ${referenceTypes[i]}`
            });
          }
        }
      }
    });
    
    // Determinar status geral
    const isConsistent = allSameCount && allSameTypes;
    
    // Formatar mensagem detalhada
    let message = isConsistent 
      ? "Consistente: Todos os cards têm a mesma quantidade e tipos de botões."
      : "Inconsistente: ";
      
    if (!allSameCount) {
      message += "Alguns cards têm números diferentes de botões. ";
    }
    
    if (!allSameTypes) {
      message += "Alguns cards têm tipos diferentes de botões. ";
    }
    
    // Incluir informações sobre padronização
    if (!isConsistent) {
      // Encontrar o card com mais botões
      const maxButtonCount = Math.max(...activeCards.map(card => card.buttons.length));
      const templateCard = activeCards.find(card => card.buttons.length === maxButtonCount);
      const templateIndex = activeCards.indexOf(templateCard);
      
      message += `A padronização usará como modelo o Card ${templateIndex + 1} com ${maxButtonCount} botões.`;
    }
    
    return {
      isConsistent,
      message,
      inconsistentCards,
      allSameCount,
      allSameTypes
    };
  }, [cards, numCards]);

  // Padronizar botões entre todos os cards
  const standardizeButtons = useCallback(() => {
    const activeCards = cards.slice(0, numCards);
    
    // Se tiver apenas um card, não precisa padronizar
    if (activeCards.length <= 1) {
      return cards;
    }
    
    // Encontrar o card com mais botões para usar como modelo
    const maxButtonCount = Math.max(...activeCards.map(card => card.buttons.length));
    const templateCard = activeCards.find(card => card.buttons.length === maxButtonCount);
    const templateButtons = templateCard.buttons;
    
    // Criar cópia dos cards para modificação
    const standardizedCards = [...cards];
    
    // Padronizar todos os cards ativos
    for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
      const card = standardizedCards[cardIndex];
      
      // Se já é o card template, pular
      if (card === templateCard) continue;
      
      const newButtons = [];
      
      // Para cada botão no card modelo
      for (let btnIndex = 0; btnIndex < templateButtons.length; btnIndex++) {
        const templateButton = templateButtons[btnIndex];
        
        if (btnIndex < card.buttons.length) {
          // Card já tem este botão, atualizar apenas o tipo
          const existingButton = card.buttons[btnIndex];
          newButtons.push({
            ...existingButton,
            type: templateButton.type,
            // Garantir campos específicos do tipo
            ...(templateButton.type === 'URL' && !existingButton.url ? { url: '' } : {}),
            ...(templateButton.type === 'PHONE_NUMBER' && !existingButton.phoneNumber ? { phoneNumber: '' } : {}),
            ...(templateButton.type === 'QUICK_REPLY' && !existingButton.payload ? { payload: '' } : {})
          });
        } else {
          // Card não tem este botão, criar novo baseado no template
          newButtons.push({
            type: templateButton.type,
            text: '', // Texto vazio para o usuário preencher
            ...(templateButton.type === 'URL' ? { url: '' } : {}),
            ...(templateButton.type === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
            ...(templateButton.type === 'QUICK_REPLY' ? { payload: '' } : {})
          });
        }
      }
      
      standardizedCards[cardIndex] = { ...card, buttons: newButtons };
    }
    
    return standardizedCards;
  }, [cards, numCards]);

  // Aplicar padronização de botões
  const applyButtonStandardization = useCallback(() => {
    const standardizedCards = standardizeButtons();
    setCards(standardizedCards);
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Exibir mensagem de sucesso
    setTimeout(() => {
      if (alert && typeof alert.success === 'function') {
        alert.success('Botões padronizados com sucesso em todos os cards!', {
          position: 'top-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [standardizeButtons, setCards, setUnsavedChanges, alert]);

  // Sincronizar tipo de botão em todos os cards
  const syncButtonType = useCallback((buttonIndex, newType) => {
    // Atualizar o tipo do botão em todos os cards ativos
    setCards(prev => {
      const newCards = [...prev];
      
      // Percorrer todos os cards ativos
      for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
        // Verificar se o card tem um botão nesse índice
        if (newCards[cardIndex].buttons.length > buttonIndex) {
          const cardButtons = [...newCards[cardIndex].buttons];
          const existingButton = cardButtons[buttonIndex];
          
          // Atualizar o tipo do botão mantendo os outros campos
          cardButtons[buttonIndex] = {
            ...existingButton,
            type: newType,
            // Adicionar campos específicos do tipo se não existirem
            ...(newType === 'URL' && !existingButton.url ? { url: '' } : {}),
            ...(newType === 'PHONE_NUMBER' && !existingButton.phoneNumber ? { phoneNumber: '' } : {}),
            ...(newType === 'QUICK_REPLY' && !existingButton.payload ? { payload: '' } : {})
          };
          
          // Atualizar o card
          newCards[cardIndex] = {
            ...newCards[cardIndex],
            buttons: cardButtons
          };
        }
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Informar sobre a sincronização
    setTimeout(() => {
      if (alert && typeof alert.info === 'function') {
        alert.info(`Tipo de botão "${newType}" sincronizado em todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [numCards, setCards, setUnsavedChanges, alert]);

  // Sincronizar adição de botão em todos os cards
  const syncAddButton = useCallback((cardIndex, buttonType = 'QUICK_REPLY') => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Adicionar novo botão em todos os cards ativos
      for (let i = 0; i < numCards; i++) {
        if (i !== cardIndex) {
          const newButton = { 
            type: buttonType, 
            text: '',
            ...(buttonType === 'URL' ? { url: '' } : {}),
            ...(buttonType === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
            ...(buttonType === 'QUICK_REPLY' ? { payload: '' } : {})
          };
          
          const cardButtons = [...newCards[i].buttons, newButton];
          newCards[i] = { ...newCards[i], buttons: cardButtons };
        }
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Informar sobre a adição de botões
    setTimeout(() => {
      if (alert && typeof alert.info === 'function') {
        alert.info(`Botão do tipo "${buttonType}" adicionado a todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [numCards, setCards, setUnsavedChanges, alert]);

  // Sincronizar remoção de botão em todos os cards
  const syncRemoveButton = useCallback((buttonIndex) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Remover o botão em todos os cards ativos
      for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
        const cardButtons = newCards[cardIndex].buttons.filter((_, idx) => idx !== buttonIndex);
        newCards[cardIndex] = { ...newCards[cardIndex], buttons: cardButtons };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Informar sobre a remoção de botões
    setTimeout(() => {
      if (alert && typeof alert.warning === 'function') {
        alert.warning(`Botão removido de todos os cards`, {
          position: 'bottom-right',
          autoCloseTime: 3000
        });
      }
    }, 0);
  }, [numCards, setCards, setUnsavedChanges, alert]);
  
  // Atualizar um campo específico de um botão em um card
  const updateButtonField = useCallback((cardIndex, buttonIndex, field, value) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Verificar se o card existe
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        const card = newCards[cardIndex];
        
        // Verificar se o botão existe
        if (buttonIndex >= 0 && buttonIndex < card.buttons.length) {
          // Criar cópias para preservar imutabilidade
          const newButtons = [...card.buttons];
          newButtons[buttonIndex] = { ...newButtons[buttonIndex], [field]: value };
          
          // Atualizar o card com os novos botões
          newCards[cardIndex] = { ...card, buttons: newButtons };
        }
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Se estiver alterando o tipo do botão e for o primeiro card, sincronizar com os outros
    if (field === 'type' && cardIndex === 0 && numCards > 1) {
      syncButtonType(buttonIndex, value);
    }
    
    // Limpar erro de validação relacionado a este campo
    if (validationErrors[`card_${cardIndex}_button_${buttonIndex}_${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`card_${cardIndex}_button_${buttonIndex}_${field}`];
        return newErrors;
      });
    }
  }, [setCards, setUnsavedChanges, numCards, syncButtonType, validationErrors, setValidationErrors]);
  
  // Adicionar um novo botão a um card
  const addButton = useCallback((cardIndex) => {
    // Verificar se já possui o máximo de botões
    const card = cards[cardIndex];
    if (!card || card.buttons.length >= 2) {
      // Mostrar alerta sobre o limite de botões
      setTimeout(() => {
        if (alert && typeof alert.warning === 'function') {
          alert.warning('Cada card pode ter no máximo 2 botões', {
            position: 'top-center'
          });
        }
      }, 0);
      return;
    }
    
    // Obter o tipo de botão padrão (usar o tipo do primeiro botão do primeiro card, ou QUICK_REPLY)
    const defaultButtonType = cards[0]?.buttons[0]?.type || 'QUICK_REPLY';
    
    setCards(prev => {
      const newCards = [...prev];
      
      // Se o card existe
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        const newButton = { 
          type: defaultButtonType, 
          text: '',
          ...(defaultButtonType === 'URL' ? { url: '' } : {}),
          ...(defaultButtonType === 'PHONE_NUMBER' ? { phoneNumber: '' } : {}),
          ...(defaultButtonType === 'QUICK_REPLY' ? { payload: '' } : {})
        };
        
        // Adicionar novo botão aos botões existentes
        const newButtons = [...newCards[cardIndex].buttons, newButton];
        newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Se tiver mais de um card, sincronizar a adição com os outros cards
    if (numCards > 1) {
      syncAddButton(cardIndex, defaultButtonType);
    } else {
      // Mostrar alerta sobre adição de botão
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Botão adicionado ao Card ${cardIndex + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    }
  }, [cards, numCards, setCards, setUnsavedChanges, syncAddButton, alert]);
  
  // Remover um botão de um card
  const removeButton = useCallback((cardIndex, buttonIndex) => {
    setCards(prev => {
      const newCards = [...prev];
      
      // Se o card existe
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        // Remover o botão especificado
        const newButtons = newCards[cardIndex].buttons.filter((_, i) => i !== buttonIndex);
        newCards[cardIndex] = { ...newCards[cardIndex], buttons: newButtons };
      }
      
      return newCards;
    });
    
    // Marcar alterações não salvas
    setUnsavedChanges(true);
    
    // Se tiver mais de um card, sincronizar a remoção com os outros cards
    if (numCards > 1) {
      syncRemoveButton(buttonIndex);
    } else {
      // Mostrar alerta sobre remoção de botão
      setTimeout(() => {
        if (alert && typeof alert.info === 'function') {
          alert.info(`Botão removido do Card ${cardIndex + 1}`, {
            position: 'bottom-right',
            autoCloseTime: 2000
          });
        }
      }, 0);
    }
  }, [numCards, setCards, setUnsavedChanges, syncRemoveButton, alert]);

  return {
    checkButtonConsistency,
    standardizeButtons,
    applyButtonStandardization,
    syncButtonType,
    syncAddButton,
    syncRemoveButton,
    updateButtonField,
    addButton,
    removeButton
  };
};