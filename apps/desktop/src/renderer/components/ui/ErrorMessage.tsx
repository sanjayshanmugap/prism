import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  error?: Error | string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  error,
  onDismiss,
  className = ''
}) => {
  const errorMessage = message || (error instanceof Error ? error.message : String(error)) || 'An unexpected error occurred';

  return (
    <div className={`glass-panel border-red-500/30 bg-red-500/10 p-4 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-red-200 text-sm font-medium mb-1">Error</p>
          <p className="text-red-100/90 text-sm leading-relaxed break-words">
            {errorMessage}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-300/60 hover:text-red-200 transition-colors flex-shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};