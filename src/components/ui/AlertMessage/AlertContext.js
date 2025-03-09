// components/common/AlertContext.js
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import AlertMessage from './AlertMessage';
import { createPortal } from 'react-dom';

// Create context
const AlertContext = createContext(null);

// Unique ID generator
const generateId = () => `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Reducer for managing alerts
const alertReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ALERT':
      return [...state, { id: generateId(), ...action.payload }];
    case 'REMOVE_ALERT':
      return state.filter(alert => alert.id !== action.payload);
    default:
      return state;
  }
};

/**
 * AlertProvider component for managing multiple alerts with different positions
 */
export const AlertProvider = ({ children }) => {
  const [alerts, dispatch] = useReducer(alertReducer, []);
  
  const removeAlert = useCallback((id) => {
    dispatch({ type: 'REMOVE_ALERT', payload: id });
  }, []);

  const showAlert = useCallback((alertProps) => {
    const id = generateId();
    dispatch({ 
      type: 'ADD_ALERT', 
      payload: { 
        ...alertProps, 
        id,
        onClose: () => {
          if (alertProps.onClose) alertProps.onClose();
          removeAlert(id);
        }
      } 
    });
    return id;
  }, [removeAlert]);

  // Group alerts by position for proper rendering
  const alertsByPosition = alerts.reduce((acc, alert) => {
    const position = alert.position || 'top-right';
    if (!acc[position]) acc[position] = [];
    acc[position].push(alert);
    return acc;
  }, {});

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      
      {typeof document !== 'undefined' && createPortal(
        <>
          {Object.entries(alertsByPosition).map(([position, positionAlerts]) => (
            <div key={position} className={`alert-container-${position}`}>
              {positionAlerts.map(alert => (
                <AlertMessage
                  key={alert.id}
                  {...alert}
                  floating={true}
                  position={position}
                />
              ))}
            </div>
          ))}
        </>,
        document.body
      )}
    </AlertContext.Provider>
  );
};

/**
 * Hook for using alerts in any component
 * @returns {Object} Alert methods (success, error, warning, info)
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  
  return {
    /**
     * Show success alert
     * @param {string} message Alert message
     * @param {Object} options Additional options (position, autoClose, autoCloseTime, etc.)
     * @returns {string} Alert ID
     */
    success: (message, options = {}) => {
      return context.showAlert({ success: message, ...options });
    },
    
    /**
     * Show error alert
     * @param {string} message Alert message
     * @param {Object} options Additional options (position, autoClose, autoCloseTime, etc.)
     * @returns {string} Alert ID
     */
    error: (message, options = {}) => {
      return context.showAlert({ error: message, ...options });
    },
    
    /**
     * Show warning alert
     * @param {string} message Alert message
     * @param {Object} options Additional options (position, autoClose, autoCloseTime, etc.)
     * @returns {string} Alert ID
     */
    warning: (message, options = {}) => {
      return context.showAlert({ warning: message, ...options });
    },
    
    /**
     * Show info alert
     * @param {string} message Alert message
     * @param {Object} options Additional options (position, autoClose, autoCloseTime, etc.)
     * @returns {string} Alert ID
     */
    info: (message, options = {}) => {
      return context.showAlert({ info: message, ...options });
    },
    
    /**
     * Remove specific alert
     * @param {string} id Alert ID to remove
     */
    remove: (id) => {
      context.removeAlert(id);
    }
  };
};

export default AlertContext;