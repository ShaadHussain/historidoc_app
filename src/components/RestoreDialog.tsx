import React, { useState, useEffect } from 'react';
import './RestoreDialog.css';

interface RestoreDialogProps {
  versionMessage: string;
  onConfirm: (mode: 'reset' | 'commit', commitMessage: string, savePreference: boolean) => void;
  onCancel: () => void;
}

const RestoreDialog = ({ versionMessage, onConfirm, onCancel }: RestoreDialogProps) => {
  const [mode, setMode] = useState<'reset' | 'commit'>('reset');
  const [commitMessage, setCommitMessage] = useState('');
  const [savePreference, setSavePreference] = useState(false);

  useEffect(() => {
    setMode('reset');
    setCommitMessage('');
    setSavePreference(false);
  }, [versionMessage]);

  const handleConfirm = () => {
    const message = mode === 'commit'
      ? (commitMessage.trim() || `Restored to ${versionMessage}`)
      : '';
    onConfirm(mode, message, savePreference);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="restore-dialog-overlay" onClick={onCancel}>
      <div className="restore-dialog" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h3>Restore Version</h3>
        <p className="restore-dialog-subtitle">How do you want to restore <span className="restore-version-name">"{versionMessage}"</span>?</p>

        <div className="restore-options">
          <label className={`restore-option-card${mode === 'reset' ? ' selected' : ''}`}>
            <input
              type="radio"
              name="restore-mode"
              value="reset"
              checked={mode === 'reset'}
              onChange={() => setMode('reset')}
            />
            <div className="restore-option-content">
              <div className="restore-option-title">Remove future versions</div>
              <div className="restore-option-desc">Resets history to this point. Any versions newer than "{versionMessage}" will be permanently deleted.</div>
              {mode === 'reset' && (
                <div className="restore-option-warning">This cannot be undone.</div>
              )}
            </div>
          </label>

          <label className={`restore-option-card${mode === 'commit' ? ' selected' : ''}`}>
            <input
              type="radio"
              name="restore-mode"
              value="commit"
              checked={mode === 'commit'}
              onChange={() => setMode('commit')}
            />
            <div className="restore-option-content">
              <div className="restore-option-title">Restore as new version</div>
              <div className="restore-option-desc">Keeps all existing history and saves a new version on top with the contents of "{versionMessage}".</div>
              {mode === 'commit' && (
                <input
                  type="text"
                  className="restore-commit-input"
                  placeholder={`Restored to ${versionMessage}`}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </label>
        </div>

        <div className="restore-dialog-footer">
          <label className="restore-save-pref-label">
            <input
              type="checkbox"
              checked={savePreference}
              onChange={(e) => setSavePreference(e.target.checked)}
            />
            Remember my choice
          </label>
          {savePreference && (
            <div className="restore-save-pref-hint">You can change this anytime in Settings (⌘,)</div>
          )}
        </div>

        <div className="restore-dialog-actions">
          <button className="restore-cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="restore-confirm-btn" onClick={handleConfirm}>Restore</button>
        </div>
      </div>
    </div>
  );
};

export default RestoreDialog;
