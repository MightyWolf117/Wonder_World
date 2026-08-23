import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  className?: string;
  label?: string;
  value?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = 'azul',
  className,
  label,
  value
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  // Backwards compatibility with predefined classes or direct css vars
  const isPredefined = ['azul', 'verde', 'amarillo', 'rojo'].includes(color);
  const colorClass = 
    color === 'verde' ? styles.fillVerde :
    color === 'amarillo' ? styles.fillAmarillo :
    color === 'rojo' ? styles.fillRojo :
    isPredefined ? styles.fillAzul : '';

  const customStyle = !isPredefined ? { backgroundColor: color, boxShadow: `0 0 5px ${color}` } : {};

  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      {(label || value) && (
        <div className={styles.barHeader}>
          {label && <span className={styles.barLabel}>{label}</span>}
          {value && <span className={styles.barValue}>{value}</span>}
        </div>
      )}
      <div className={styles.barContainer}>
        <div 
          className={`${styles.fill} ${colorClass}`} 
          style={{ width: `${safeProgress}%`, ...customStyle }}
        />
      </div>
    </div>
  );
};
