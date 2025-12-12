import { useState } from 'react';

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export function useActivityDialog() {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showSuccess = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'success'
    });
  };

  const showError = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'error'
    });
  };

  const showWarning = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'warning'
    });
  };

  const showInfo = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'info'
    });
  };

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void | Promise<void>,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  return {
    dialog,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeDialog
  };
}