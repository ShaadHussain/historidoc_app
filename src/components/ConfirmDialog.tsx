import { useState } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  show: boolean;
  fileName: string;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  show,
  fileName,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    onConfirm(dontAskAgain);
    setDontAskAgain(false);
  };

  const handleCancel = () => {
    onCancel();
    setDontAskAgain(false);
  };

  if (!show) return null;

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>Track File?</h3>
        </div>

        <div className="dialog-body">
          <p>Do you want to track this file?</p>
          <div className="file-name">{fileName}</div>
        </div>

        <div className="dialog-footer">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
            />
            <span>Don't ask me again</span>
          </label>

          <div className="button-group">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={handleConfirm}>
              Track File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
