import React from 'react';
import styles from './TerminalLog.module.css';

interface TerminalLogProps {
  logs: string[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  return (
    <div className={styles.terminalLog}>
      {logs.map((log, index) => (
        <div key={index} className={styles.logEntry}>
          &gt; {log}
        </div>
      ))}
    </div>
  );
};
