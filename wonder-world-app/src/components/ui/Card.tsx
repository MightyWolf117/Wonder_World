import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, value, children, className }) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.title}>{title}</div>
      {value && <div className={styles.value}>{value}</div>}
      {children}
    </div>
  );
};
