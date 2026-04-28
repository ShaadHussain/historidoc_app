import React, { useState, useEffect } from 'react';
import './RelinkDialog.css';

interface RelinkDialogProps {
  missingFilePath: string;
  onRelink: (oldPath: string, newPath: string) => void;
  onStartFresh: (oldPath: string, newPath: string) => void;
  onDismiss: () => void;
  onSuppressMovePrompt: () => void;
}

const getFileName = (filePath: string): string =>
  filePath.split('/').pop() || filePath.split('\\').pop() || filePath;

const RelinkDialog = ({ missingFilePath, onRelink, onStartFresh, onDismiss, onSuppressMovePrompt }: RelinkDialogProps) => {
  const [chosenPath, setChosenPath] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(true);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    window.electron.getLastVersionContent(missingFilePath).then((result) => {
      setPreviewContent(result.success ? result.content : '');
      setPreviewLoading(false);
    });
  }, [missingFilePath]);

  const handleChooseFile = async () => {
    const filePath = await window.electron.selectFile();
    if (filePath) setChosenPath(filePath);
  };

  const handleDismiss = () => {
    if (dontAskAgain) onSuppressMovePrompt();
    onDismiss();
  };

  const handleRelink = () => {
    if (!chosenPath) return;
    if (dontAskAgain) onSuppressMovePrompt();
    onRelink(missingFilePath, chosenPath);
  };

  const handleStartFresh = () => {
    if (!chosenPath) return;
    if (dontAskAgain) onSuppressMovePrompt();
    onStartFresh(missingFilePath, chosenPath);
  };

  const previewLines = previewContent.split('\n').slice(0, 10).join('\n');

  return (
    <div className="relink-overlay" onClick={handleDismiss}>
      <div className="relink-modal" onClick={(e) => e.stopPropagation()}>

        <div className="relink-header">
          <div className="relink-title">File Not Found</div>
          <div className="relink-filename">{getFileName(missingFilePath)}</div>
        </div>

        <div className="relink-body">
          <div className="relink-warning">
            Make sure the file you select is the same file in a new location.
            If you link an unrelated file, the two files will share one history — older versions
            will still describe <strong>{getFileName(missingFilePath)}</strong>, and restoring
            them would overwrite your new file with that content.
          </div>

          <div className="relink-preview-section">
            <div className="relink-preview-label">Last saved version preview</div>
            <div className="relink-preview">
              {previewLoading
                ? 'Loading preview...'
                : previewContent
                  ? previewLines
                  : 'No saved versions yet.'}
            </div>
          </div>

          <div className="relink-choose">
            <div className="relink-choose-label">New location</div>
            {chosenPath ? (
              <div className="relink-chosen-path">
                <span>{chosenPath}</span>
                <button className="relink-change-btn" onClick={handleChooseFile}>Change</button>
              </div>
            ) : (
              <button className="relink-pick-btn" onClick={handleChooseFile}>
                Choose new location
              </button>
            )}
          </div>
        </div>

        <div className="relink-footer">
          <label className="relink-suppress">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
            />
            Don't ask again when files go missing
          </label>

          <div className="relink-actions">
            <button className="relink-dismiss-btn" onClick={handleDismiss}>Dismiss</button>
            {chosenPath && (
              <>
                <button className="relink-fresh-btn" onClick={handleStartFresh}>Start Fresh</button>
                <button className="relink-confirm-btn" onClick={handleRelink}>Re-link</button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RelinkDialog;
