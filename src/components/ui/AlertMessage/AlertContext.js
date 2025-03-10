// components/ui/AlertMessage/AlertContext.js - Versão melhorada
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import AlertMessage from './AlertMessage';

// Create the context for alerts
export const AlertContext = createContext(null);

// Default configuration for alerts
const defaultConfig = {
  position: 'top-right',
  autoCloseTime: 5000,
  closable: true,
};

/**
 * Provider component for the Alert system
 * Versão melhorada com menos throttling e melhor gerenciamento de estados
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const AlertProvider = ({ children }) => {
  // State to store alerts
  const [alerts, setAlerts] = useState([]);
  
  // Refs to track alert state between renders
  const enabled = useRef(true);
  const lastAlertTime = useRef(0);
  const alertMessageCache = useRef(new Map());
  const alertCount = useRef(0);
  
  // Remove an alert by ID
  const removeAlert = useCallback((id) => {
    setAlerts((currentAlerts) => 
      currentAlerts.filter((alert) => alert.id !== id)
    );
    // Decrease alert count when an alert is removed
    alertCount.current = Math.max(0, alertCount.current - 1);
  }, []);

  // Clear all alerts
  const clearAll = useCallback(() => {
    setAlerts([]);
    alertCount.current = 0;
  }, []);

  // Function to add alerts with proper object serialization
  const addAlert = useCallback((content, type, config = {}) => {
    // Ensure enabled state
    if (!enabled.current) {
      console.log(`Alert skipped (disabled): ${content}`);
      return null;
    }
    
    // Generate unique ID
    const id = `alert_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Merge with default configuration
    const alertConfig = { ...defaultConfig, ...config };
    
    // Create the new alert
    const newAlert = {
      id,
      content,
      type,
      ...alertConfig,
    };
    
    // Add the alert to the state
    setAlerts((currentAlerts) => [...currentAlerts, newAlert]);
    alertCount.current += 1;
    
    // If auto-close is enabled, set a timeout to remove the alert
    if (alertConfig.autoCloseTime > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, alertConfig.autoCloseTime);
    }
    
    return id;
  }, [removeAlert]);

  // Create type-specific alert functions
  const info = useCallback((content, config = {}) => {
    return addAlert(content, 'info', config);
  }, [addAlert]);
  
  const success = useCallback((content, config = {}) => {
    return addAlert(content, 'success', config);
  }, [addAlert]);
  
  const warning = useCallback((content, config = {}) => {
    return addAlert(content, 'warning', config);
  }, [addAlert]);
  
  const error = useCallback((content, config = {}) => {
    return addAlert(content, 'error', config);
  }, [addAlert]);

  // Improved guardAlert with less throttling and better caching
  const guardAlert = useCallback((type, ...args) => {
    // Skip if alerts are disabled
    if (!enabled.current) {
      console.log(`Alert skipped (not enabled): ${args[0]}`);
      return null;
    }
    
    // Get alert content
    const content = typeof args[0] === 'string' ? args[0] : 'Teste';
    const config = args[1] || {};
    
    // Throttle alerts - prevent too many in quick succession
    // Reduced from 500ms to 300ms for less aggressive throttling
    const now = Date.now();
    if (now - lastAlertTime.current < 300) {
      console.log(`Alert skipped (too frequent): ${content}`);
      return null;
    }
    
    // Create a key for caching
    const cacheKey = `${type.name}:${content}`;
    
    // Check for duplicate alerts (only if they're identical)
    if (alertMessageCache.current.has(cacheKey)) {
      const lastTime = alertMessageCache.current.get(cacheKey);
      // Only consider as duplicate if seen in the last 3 seconds
      if (now - lastTime < 3000) {
        console.log(`Alert skipped (duplicate): ${content}`);
        return null;
      }
    }
    
    // Limit total active alerts - increased from 3 to 5
    if (alertCount.current >= 5) {
      console.log(`Alert skipped (too many): ${content}`);
      return null;
    }
    
    // Update tracking variables
    lastAlertTime.current = now;
    alertMessageCache.current.set(cacheKey, now);
    
    // Clean up old cache entries
    if (alertMessageCache.current.size > 50) {
      // Remove entries older than 10 seconds
      const oldThreshold = now - 10000;
      for (const [key, timestamp] of alertMessageCache.current.entries()) {
        if (timestamp < oldThreshold) {
          alertMessageCache.current.delete(key);
        }
      }
    }
    
    // Call the appropriate function in a try-catch block
    try {
      // Make sure the function exists
      if (typeof type === 'function') {
        return type(content, config);
      } else {
        throw new Error(`Invalid alert type: ${type}`);
      }
    } catch (err) {
      console.error(`Error showing alert: ${err.message}`, content);
      return null;
    }
  }, [info, success, warning, error]);

  // Create the context value
  const contextValue = {
    alerts,
    removeAlert,
    clearAll,
    // Wrap alert functions with the guard
    info: (...args) => guardAlert(info, ...args),
    success: (...args) => guardAlert(success, ...args),
    warning: (...args) => guardAlert(warning, ...args),
    error: (...args) => guardAlert(error, ...args),
    // Utility functions
    disable: () => { enabled.current = false; },
    enable: () => { enabled.current = true; },
    getAlertCount: () => alertCount.current
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <div className="alert-container">
        {alerts.map((alert) => (
          <AlertMessage
            key={alert.id}
            id={alert.id}
            type={alert.type}
            content={alert.content}
            position={alert.position}
            onClose={() => removeAlert(alert.id)}
            closable={alert.closable}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

/**
 * Custom hook to use the alert context
 * @returns {Object} The alert context
 * @throws {Error} If used outside of an AlertProvider
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    console.warn('useAlert used outside of AlertProvider. Alerts will be simulated.');
    
    // Provide dummy functions if context is not available
    return {
      info: (message) => { 
        console.log(`Alert (simulated INFO): ${message}`);
        return null;
      },
      success: (message) => {
        console.log(`Alert (simulated SUCCESS): ${message}`);
        return null;
      },
      warning: (message) => {
        console.log(`Alert (simulated WARNING): ${message}`);
        return null;
      },
      error: (message) => {
        console.log(`Alert (simulated ERROR): ${message}`);
        return null;
      },
      clearAll: () => {},
      removeAlert: () => {},
      getAlertCount: () => 0
    };
  }
  
  return context;
};

/**
 * Enhanced AlertMessage component with safety checks
 * Helps manage alerts during render cycles
 */
export const SafeAlert = {
  // Use setTimeout to avoid calling alerts during render
  info: (alert, message, config = {}) => {
    if (!alert || !alert.info) return null;
    setTimeout(() => {
      alert.info(message, config);
    }, 0);
    return null;
  },
  
  success: (alert, message, config = {}) => {
    if (!alert || !alert.success) return null;
    setTimeout(() => {
      alert.success(message, config);
    }, 0);
    return null;
  },
  
  warning: (alert, message, config = {}) => {
    if (!alert || !alert.warning) return null;
    setTimeout(() => {
      alert.warning(message, config);
    }, 0);
    return null;
  },
  
  error: (alert, message, config = {}) => {
    if (!alert || !alert.error) return null;
    setTimeout(() => {
      alert.error(message, config);
    }, 0);
    return null;
  }
};

// Export the default context for backward compatibility
export default AlertContext;