import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface DialogOptions {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
  onConfirm?: () => void;
}

interface DialogContextProps {
  showAlert: (options: DialogOptions) => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within DialogProvider");
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const showAlert = (opts: DialogOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (options?.onConfirm) {
      options.onConfirm();
    }
  };

  let color = 'var(--azul-ego)';
  if (options?.type === 'warning') color = 'var(--amarillo-mood)';
  if (options?.type === 'error') color = 'var(--rojo-alerta)';

  return (
    <DialogContext.Provider value={{ showAlert }}>
      {children}
      {options && (
        <Modal 
          isOpen={isOpen} 
          onClose={handleClose} 
          title={options.title || "MENSAJE DEL SISTEMA"}
        >
          <div style={{ color: 'var(--texto)', marginBottom: '20px', fontSize: '1.1rem' }}>
            {options.message}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="advance" 
              onClick={handleClose} 
              style={{ borderColor: color, color: color }}
            >
              ENTENDIDO
            </Button>
          </div>
        </Modal>
      )}
    </DialogContext.Provider>
  );
};
