// hooks/useAlertSafe.js
import { useContext, useRef, useState, useEffect } from 'react';
import AlertContext from '../components/ui/AlertMessage/AlertContext';

// Cache global para evitar duplicação de alertas em um curto período
const alertCache = {
  messages: new Map(),
  timeout: 3000 // Tempo para considerar mensagem como repetida
};

/**
 * Hook para usar o sistema de alertas com proteção contra loops.
 * 
 * @returns {Object} Métodos de alerta seguros (success, error, warning, info)
 */
export const useAlertSafe = () => {
  // Tenta obter o contexto de alerta
  const context = useContext(AlertContext);
  
  // Referência para armazenar se este é o carregamento inicial
  const initialRenderRef = useRef(true);
  
  // Estado local para evitar repetição de alertas
  const [enableAlerts, setEnableAlerts] = useState(false);
  
  // Habilitar alertas após o carregamento inicial
  useEffect(() => {
    // Aguardar componente montar totalmente
    const timer = setTimeout(() => {
      initialRenderRef.current = false;
      setEnableAlerts(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Função de proteção contra loops
  const guardAlert = (type, message, options = {}) => {
    // Não mostrar alertas durante renderização inicial
    if (initialRenderRef.current) {
      console.log('Alerta ignorado (renderização inicial):', message);
      return 'initial-render-skipped';
    }
    
    // Não mostrar se alertas não estão habilitados ainda
    if (!enableAlerts) {
      console.log('Alerta ignorado (não habilitado):', message);
      return 'not-enabled-yet';
    }
    
    // Verificar se a mensagem é repetida em um curto espaço de tempo
    const key = `${type}:${message}`;
    const now = Date.now();
    
    if (alertCache.messages.has(key)) {
      const lastTime = alertCache.messages.get(key);
      
      // Se a mensagem apareceu recentemente, ignorar
      if (now - lastTime < alertCache.timeout) {
        console.log('Alerta ignorado (repetido):', message);
        return 'duplicate';
      }
    }
    
    // Armazenar a mensagem no cache
    alertCache.messages.set(key, now);
    
    // Limpar mensagens antigas do cache periodicamente
    if (alertCache.messages.size > 50) {
      for (const [msgKey, timestamp] of alertCache.messages.entries()) {
        if (now - timestamp > alertCache.timeout * 2) {
          alertCache.messages.delete(msgKey);
        }
      }
    }
    
    // Se chegou até aqui, retorna a função real de alerta
    if (context) {
      try {
        return context[type](message, {
          ...options,
          autoClose: options.autoClose ?? true,
          autoCloseTime: options.autoCloseTime ?? 5000
        });
      } catch (error) {
        console.error('Erro ao mostrar alerta:', error, message);
        return 'error';
      }
    } else {
      // Fallback para quando o contexto não está disponível
      console.log(`🔔 Alerta ${type} (simulado):`, message);
      return 'simulated';
    }
  };
  
  // Retorna versão protegida contra loops
  return {
    success: (message, options) => guardAlert('success', message, options),
    error: (message, options) => guardAlert('error', message, options),
    warning: (message, options) => guardAlert('warning', message, options),
    info: (message, options) => guardAlert('info', message, options),
    
    // Método para remover alerta
    remove: (id) => {
      if (context?.remove) {
        context.remove(id);
      }
    },
    
    // Flags para debugging
    _isInitialRender: initialRenderRef.current,
    _areAlertsEnabled: enableAlerts,
    _resetCache: () => alertCache.messages.clear()
  };
};

export default useAlertSafe;