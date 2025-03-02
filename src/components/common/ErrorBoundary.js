// components/common/ErrorBoundary.js
import React, { Component } from 'react';

/**
 * Componente de limite de erro que captura erros em qualquer componente filho
 * e exibe uma UI alternativa em vez de fazer o aplicativo falhar
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
   * Atualiza o estado para que a próxima renderização mostre a UI de fallback
   * @param {Error} error - O erro que foi lançado
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Chamado quando um erro foi capturado
   * Útil para registrar o erro
   * @param {Error} error - O erro que foi lançado
   * @param {Object} errorInfo - Informações sobre o erro
   */
  componentDidCatch(error, errorInfo) {
    // Registrar o erro em um serviço de relatório de erros
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Você pode enviar o erro para um serviço como Sentry aqui
  }

  /**
   * Reinicia o estado do limite de erro
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback
      return (
        <div style={{
          padding: '2rem',
          margin: '1rem',
          backgroundColor: '#fff8f8',
          border: '1px solid #ffe0e0',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#e60f0f', marginBottom: '1rem' }}>
            Ops! Algo deu errado.
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Ocorreu um erro ao renderizar este componente.
          </p>
          
          {this.props.showDetails && this.state.error && (
            <details style={{ 
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: '0.25rem'
            }}>
              <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                Detalhes do erro
              </summary>
              <pre style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                overflowX: 'auto',
                backgroundColor: '#f3f3f3',
                fontSize: '0.85rem'
              }}>
                {this.state.error.toString()}
              </pre>
              {this.state.errorInfo && (
                <pre style={{ 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  overflowX: 'auto',
                  backgroundColor: '#f3f3f3',
                  fontSize: '0.85rem',
                  maxHeight: '20rem'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={this.handleReset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1968F0',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Tentar Novamente
            </button>
            
            {this.props.fallbackRender && (
              <button
                onClick={() => this.props.fallbackAction?.()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                {this.props.fallbackActionText || 'Voltar'}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Renderiza os filhos normalmente se não houver erro
    return this.props.children;
  }
}

export default ErrorBoundary;