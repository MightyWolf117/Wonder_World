import React, { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      {children && (
        <>
          <button className={styles.menuToggle} onClick={() => setIsOpen(!isOpen)}>
            ☰ Menu
          </button>
          
          {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
          
          <div className={`${styles.actions} ${isOpen ? styles.actionsOpen : ''}`}>
            {children}
          </div>
        </>
      )}
    </header>
  );
};
