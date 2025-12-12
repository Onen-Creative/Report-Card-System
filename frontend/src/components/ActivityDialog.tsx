import { useState } from 'react';

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ActivityDialog({
  isOpen,
  onClose,
  title,
  message,
  type,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ActivityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        console.error('Action failed:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'confirm': return '❓';
      default: return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-500';
      case 'error': return 'from-red-500 to-rose-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'info': return 'from-blue-500 to-indigo-500';
      case 'confirm': return 'from-purple-500 to-indigo-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className={`bg-gradient-to-r ${getColors()} p-6 rounded-t-2xl text-white`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getIcon()}</div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed mb-6">{message}</p>
          
          <div className="flex gap-3 justify-end">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`px-6 py-3 bg-gradient-to-r ${getColors()} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2`}
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-8 py-3 bg-gradient-to-r ${getColors()} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}