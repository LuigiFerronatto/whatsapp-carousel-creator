// components/ui/ThemeSwitcher/ThemeSwitcher.js
import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import styles from './ThemeSwitcher.module.css';

/**
 * ThemeSwitcher - Component for switching between light, dark, and system themes
 * 
 * @returns {JSX.Element} Theme switcher component
 */
const ThemeSwitcher = () => {
  // Theme options
  const themes = [
    { id: 'light', label: 'Claro', icon: <FiSun /> },
    { id: 'dark', label: 'Escuro', icon: <FiMoon /> },
    { id: 'system', label: 'Sistema', icon: <FiMonitor /> }
  ];
  
  // Get saved theme from localStorage or default to 'system'
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('preferred-theme');
    return saved || 'system';
  });
  
  // Apply theme to document
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;
      
      if (theme === 'system') {
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
      
      // Save preference
      localStorage.setItem('preferred-theme', theme);
    };
    
    applyTheme(currentTheme);
    
    // Listen for system preference changes if using system theme
    if (currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [currentTheme]);
  
  // Handle theme change
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
  };
  
  return (
    <div className={styles.themeSwitcher}>
      <span className={styles.themeSwitcherLabel}>Tema:</span>
      <div className={styles.themeOptions}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`${styles.themeOption} ${currentTheme === theme.id ? styles.activeTheme : ''}`}
            onClick={() => handleThemeChange(theme.id)}
            aria-label={`Alternar para tema ${theme.label}`}
            title={`Alternar para tema ${theme.label}`}
          >
            <span className={styles.themeIcon}>{theme.icon}</span>
            <span className={styles.themeLabel}>{theme.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;