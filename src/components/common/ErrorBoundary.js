// components/common/ErrorBoundary.js
import React, { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import Button from './Button';
import styles from './ErrorBoundary.module.css';

/**
 * Error boundary component that catches errors in child components
 * and displays a fallback UI instead of crashing the app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state to show fallback UI in the next render
   * @param {Error} error - The error that was thrown
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Called when an error is caught
   * Useful for logging the error
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Information about the error
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You can send the error to a service like Sentry here
  }

  /**
   * Reset the error boundary state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { showDetails, fallbackAction, fallbackActionText, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // Render fallback UI
      return (
        <div className={styles.container}>
          <div className={styles.iconContainer}>
            <FiAlertTriangle className={styles.icon} />
          </div>
          
          <h2 className={styles.title}>
            Oops! Something went wrong.
          </h2>
          
          <p className={styles.message}>
            An error occurred while rendering this component.
          </p>
          
          {showDetails && error && (
            <details className={styles.details}>
              <summary className={styles.summary}>
                Error details
              </summary>
              <div className={styles.errorContent}>
                <div className={styles.errorMessage}>
                  {error.toString()}
                </div>
                {errorInfo && (
                  <pre className={styles.stackTrace}>
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          <div className={styles.actions}>
            <Button 
              variant="solid"
              color="primary"
              onClick={this.handleReset}
              iconLeft={<FiRefreshCw />}
            >
              Try Again
            </Button>
            
            {fallbackAction && (
              <Button
                variant="outline"
                color="content"
                onClick={fallbackAction}
                iconLeft={<FiArrowLeft />}
              >
                {fallbackActionText || 'Back'}
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Render children normally if there is no error
    return children;
  }
}

export default ErrorBoundary;