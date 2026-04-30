import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './OverlapWarningDialog.css';

interface OverlapWarningDialogProps {
  newPath: string;
  overlappingPaths: string[];
  onDismiss: () => void;
}

const getFileName = (p: string) => p.split('/').filter(Boolean).pop() || p;

const OverlapWarningDialog = ({ newPath, overlappingPaths, onDismiss }: OverlapWarningDialogProps) => (
  <div className="overlap-overlay" onClick={onDismiss}>
    <div className="overlap-modal" onClick={(e) => e.stopPropagation()}>

      <div className="overlap-header">
        <AlertTriangle size={16} className="overlap-icon" />
        <div className="overlap-title">Overlapping Paths Detected</div>
      </div>

      <div className="overlap-body">
        <p>
          <strong>{getFileName(newPath)}</strong> overlaps with {overlappingPaths.length} already-tracked{' '}
          {overlappingPaths.length === 1 ? 'item' : 'items'}:
        </p>
        <ul className="overlap-list">
          {overlappingPaths.map((p) => (
            <li key={p} className="overlap-list-item">{p}</li>
          ))}
        </ul>
        <p className="overlap-note">
          Both will be tracked independently with their own separate version histories.
          No action needed — this is just a heads up.
        </p>
      </div>

      <div className="overlap-actions">
        <button className="overlap-confirm-btn" onClick={onDismiss}>Got it</button>
      </div>

    </div>
  </div>
);

export default OverlapWarningDialog;
