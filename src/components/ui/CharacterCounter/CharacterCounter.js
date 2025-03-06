// components/ui/CharacterCounter/CharacterCounter.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './CharacterCounter.module.css';

/**
 * Character counter component with visual feedback
 * @param {Object} props - Component properties
 * @returns {JSX.Element} Character counter component
 */
const CharacterCounter = ({ 
  current, 
  max, 
  threshold = 75, 
  dangerThreshold = 90,
  className = '',
  variant = 'default', // 'default', 'compact', 'minimal'
  showFormatting = true // Controla se será mostrado feedback visual
}) => {
  // Calculate percentage
  const percentage = Math.min((current / max) * 100, 100);
  
  // Determine status based on thresholds (only if showFormatting is true)
  const isWarning = showFormatting && percentage >= threshold && percentage < dangerThreshold;
  const isDanger = showFormatting && percentage >= dangerThreshold;
  
  // Build class names
  const wrapperClasses = [
    styles.wrapper,
    isWarning ? styles.warning : '',
    isDanger ? styles.danger : '',
    styles[variant],
    className
  ].filter(Boolean).join(' ');
  
  const progressClasses = [
    styles.progress,
    isWarning ? styles.warningProgress : '',
    isDanger ? styles.dangerProgress : '',
  ].filter(Boolean).join(' ');
  
  const countClasses = [
    styles.count,
    isWarning ? styles.warningCount : '',
    isDanger ? styles.dangerCount : '',
  ].filter(Boolean).join(' ');

  // Render different variants
  if (variant === 'minimal') {
    return (
      <div className={wrapperClasses}>
        <span className={countClasses}>
          {current}/{max}
        </span>
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <div className={styles.progressWrapper}>
        <div 
          className={progressClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={countClasses}>
        {current}/{max}
      </span>
    </div>
  );
};

CharacterCounter.propTypes = {
  current: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  threshold: PropTypes.number,
  dangerThreshold: PropTypes.number,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  showFormatting: PropTypes.bool
};

export default CharacterCounter;