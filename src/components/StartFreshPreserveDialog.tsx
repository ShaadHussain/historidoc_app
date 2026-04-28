import React, { useState } from 'react';
import './StartFreshPreserveDialog.css';

interface StartFreshPreserveDialogProps {
  onDismiss: (alwaysDelete: boolean) => void;
}

const StartFreshPreserveDialog = ({ onDismiss }: StartFreshPreserveDialogProps) => {
  const [alwaysDelete, setAlwaysDelete] = useState(false);

  return (
    <div className="sfp-overlay" onClick={() => onDismiss(alwaysDelete)}>
      <div className="sfp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sfp-title">History Preserved</div>

        <div className="sfp-body">
          <p>
            The previous file's version history has been kept as an archived entry in your file list.
            This is a safety measure so you don't lose access to past versions.
          </p>
          <p>
            You can view or permanently delete this history at any time by selecting the archived entry
            and going to File Settings.
          </p>
        </div>

        <label className="sfp-toggle">
          <input
            type="checkbox"
            checked={alwaysDelete}
            onChange={(e) => setAlwaysDelete(e.target.checked)}
          />
          Always delete old file history after "Start Fresh"
        </label>

        <div className="sfp-actions">
          <button className="sfp-confirm-btn" onClick={() => onDismiss(alwaysDelete)}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartFreshPreserveDialog;
