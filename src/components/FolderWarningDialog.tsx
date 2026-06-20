import { useState } from "react";
import "./FolderWarningDialog.css";

interface FolderWarningDialogProps {
  folderPath: string;
  onConfirm: (dontAskAgain: boolean) => void;
  onCancel: () => void;
}

const FolderWarningDialog = ({ folderPath, onConfirm, onCancel }: FolderWarningDialogProps) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const folderName = folderPath.split("/").pop() || folderPath.split("\\").pop() || folderPath;

  const handleConfirm = () => {
    onConfirm(dontAskAgain);
    setDontAskAgain(false);
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog folder-warning-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>Tracking a Folder</h3>
        </div>

        <div className="dialog-body">
          <p className="folder-warning-intro">
            You can track folders, but there are some limitations to be aware of:
          </p>
          <ul className="folder-warning-list">
            <li>
              <span className="warning-label">No export</span> — Exporting a specific folder version to disk is not supported.
            </li>
            <li>
              <span className="warning-label">No diff view</span> — Line-by-line change diffs are not available for folders.
            </li>
            <li>
              <span className="warning-label">Disk usage</span> — Each version snapshots all files in the folder, which can grow large for big or frequently-changed folders.
            </li>
          </ul>
          <p className="folder-warning-note">
            Folders work best for periodic whole-project snapshots where these trade-offs are acceptable.
          </p>
          <div className="file-name">{folderName}</div>
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
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={handleConfirm}>
              OK, Track Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderWarningDialog;
