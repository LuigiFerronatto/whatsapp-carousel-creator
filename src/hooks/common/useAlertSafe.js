// hooks/useAlertSafe.js
import { useContext, useRef, useState, useEffect } from 'react';
import { AlertContext } from '../../components/ui/AlertMessage/AlertContext';

// Globally shared alert management
const globalAlertCache = {
  messages: new Map(),
  timeout: 5000, // Time to consider message as repeated
  lastAlertTime: 0,
  MIN_ALERT_INTERVAL: 500 // Minimum time between alerts
};

/**
 * Hook for using alerts with advanced protection against loops and duplicates
 * 
 * @returns {Object} Safe alert methods
 */
export const useAlertSafe = () => {
  // Try to get alert context
  const context = useContext(AlertContext);
  
  // Refs for tracking initial render and alert state
  const initialRenderRef = useRef(true);
  const alertCountRef = useRef(0);
  
  // State to control alert behavior
  const [enableAlerts, setEnableAlerts] = useState(false);
  
  // Enable alerts after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      initialRenderRef.current = false;
      setEnableAlerts(true);
    }, 1500); // Increased delay to ensure stability
    
    return () => clearTimeout(timer);
  }, []);
  
  // Advanced alert protection mechanism
  const guardAlert = (type, message, options = {}) => {
    // Prevent alerts during initial render
    if (initialRenderRef.current) {
      console.log('Alert skipped (initial render):', message);
      return 'initial-render-skipped';
    }
    
    // Disable alerts if not yet enabled
    if (!enableAlerts) {
      console.log('Alert skipped (not enabled):', message);
      return 'not-enabled-yet';
    }
    
    // Prevent too many alerts in quick succession
    const now = Date.now();
    if (now - globalAlertCache.lastAlertTime < globalAlertCache.MIN_ALERT_INTERVAL) {
      console.log('Alert skipped (too frequent):', message);
      return 'too-frequent';
    }
    
    // Prevent duplicate messages
    const key = `${type}:${message}`;
    if (globalAlertCache.messages.has(key)) {
      const lastTime = globalAlertCache.messages.get(key);
      
      // Skip if message is repeated within timeout
      if (now - lastTime < globalAlertCache.timeout) {
        console.log('Alert skipped (duplicate):', message);
        return 'duplicate';
      }
    }
    
    // Limit total number of alerts
    if (alertCountRef.current >= 5) {
      console.log('Alert skipped (max limit reached):', message);
      return 'max-limit';
    }
    
    // Store message in cache
    globalAlertCache.messages.set(key, now);
    globalAlertCache.lastAlertTime = now;
    alertCountRef.current++;
    
    // Clear old messages periodically
    if (globalAlertCache.messages.size > 50) {
      for (const [msgKey, timestamp] of globalAlertCache.messages.entries()) {
        if (now - timestamp > globalAlertCache.timeout * 2) {
          globalAlertCache.messages.delete(msgKey);
        }
      }
    }
    
    // Attempt to show alert
    if (context) {
      try {
        const alertResult = context[type](message, {
          ...options,
          autoClose: options.autoClose ?? true,
          autoCloseTime: options.autoCloseTime ?? 5000,
          onClose: () => {
            // Decrement alert count when closed
            alertCountRef.current = Math.max(0, alertCountRef.current - 1);
            
            // Call original onClose if provided
            if (options.onClose) options.onClose();
          }
        });
        
        return alertResult;
      } catch (error) {
        console.error('Error showing alert:', error, message);
        return 'error';
      }
    } else {
      // Fallback for when context is not available
      console.log(`🔔 Alert ${type} (simulated):`, message);
      return 'simulated';
    }
  };
  
  // Expose safe alert methods
  return {
    success: (message, options) => guardAlert('success', message, options),
    error: (message, options) => guardAlert('error', message, options),
    warning: (message, options) => guardAlert('warning', message, options),
    info: (message, options) => guardAlert('info', message, options),
    
    // Method to remove alert
    remove: (id) => {
      if (context?.removeAlert) {
        context.removeAlert(id);
      }
    },
    
    // Debugging flags
    _isInitialRender: initialRenderRef.current,
    _areAlertsEnabled: enableAlerts,
    _resetCache: () => {
      globalAlertCache.messages.clear();
      globalAlertCache.lastAlertTime = 0;
      alertCountRef.current = 0;
    }
  };
};

export default useAlertSafe;