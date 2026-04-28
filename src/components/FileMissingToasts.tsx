import React from 'react';
import { X } from 'lucide-react';
import './FileMissingToasts.css';

interface FileMissingToastsProps {
  toastFiles: string[];
  onDismiss: (filePath: string) => void;
  onSeeDetails: (filePath: string) => void;
}

const getFileName = (filePath: string): string =>
  filePath.split('/').pop() || filePath.split('\\').pop() || filePath;

const FileMissingToasts = ({ toastFiles, onDismiss, onSeeDetails }: FileMissingToastsProps) => {
  if (toastFiles.length === 0) return null;

  return (
    <div className="toasts-container">
      {toastFiles.map((filePath) => (
        <div key={filePath} className="file-missing-toast">
          <div className="toast-body">
            <div className="toast-label">File went missing</div>
            <div className="toast-filename">{getFileName(filePath)}</div>
          </div>
          <div className="toast-actions">
            <button className="toast-details-btn" onClick={() => onSeeDetails(filePath)}>
              See details
            </button>
            <button className="toast-close-btn" onClick={() => onDismiss(filePath)}>
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileMissingToasts;
