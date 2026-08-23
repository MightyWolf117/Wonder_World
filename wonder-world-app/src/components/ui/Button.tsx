import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'advance' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  className,
  ...props 
}) => {
  const variantClass = variant === 'advance' ? styles.variantAdvance : variant === 'danger' ? styles.variantDanger : '';
  
  return (
    <button 
      className={`${styles.button} ${variantClass} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
