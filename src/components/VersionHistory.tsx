import React, { useState, useEffect } from 'react';
import { Version } from '../types';
import './VersionHistory.css';

interface VersionHistoryProps {
  selectedFile: string | null;
  onRemoveFile?: (filePath: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ selectedFile, onRemoveFile }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameMessage, setRenameMessage] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      loadVersions();
    }
  }, [selectedFile]);

  const loadVersions = async () => {
    if (!window.electron || !selectedFile) return;

    setLoading(true);
    const versionsList = await window.electron.getVersions(selectedFile);
    setVersions(versionsList);
    setLoading(false);
  };

  const handleCommit = async () => {
    if (!window.electron || !selectedFile) return;

    setLoading(true);

    // Check if there are any changes
    const changeCheck = await window.electron.checkFileChanges(selectedFile);

    if (!changeCheck.hasChanges && versions.length > 0) {
      // No changes detected, show rename dialog
      setLoading(false);
      setRenameMessage(commitMessage);
      setShowRenameDialog(true);
      return;
    }

    // There are changes, proceed with normal commit
    const result = await window.electron.commitVersion(selectedFile, commitMessage);

    if (result.success) {
      setCommitMessage('');
      await loadVersions();
    }
    setLoading(false);
  };

  const handleRenameConfirm = async () => {
    if (!window.electron || !selectedFile) return;

    setLoading(true);
    const result = await window.electron.renameLastVersion(selectedFile, renameMessage || commitMessage);

    if (result.success) {
      setCommitMessage('');
      setRenameMessage('');
      await loadVersions();
    }

    setShowRenameDialog(false);
    setLoading(false);
  };

  const handleRenameCancel = () => {
    setShowRenameDialog(false);
    setRenameMessage('');
  };

  const handleRestore = async (commitHash: string) => {
    if (!window.electron || !selectedFile) return;

    const confirmed = confirm('Are you sure you want to restore this version? This will overwrite the current file.');
    if (!confirmed) return;

    setLoading(true);
    const result = await window.electron.restoreVersion(selectedFile, commitHash);

    if (result.success) {
      alert('Version restored successfully!');
    } else {
      alert('Failed to restore version: ' + result.error);
    }
    setLoading(false);
  };

  const handleExport = async (commitHash: string, versionMessage: string) => {
    if (!window.electron || !selectedFile) return;

    setLoading(true);
    const result = await window.electron.exportVersion(selectedFile, commitHash, versionMessage);

    if (result.success) {
      alert('Version exported successfully to:\n' + result.path);
    } else {
      if (result.error !== 'Export cancelled') {
        alert('Failed to export version: ' + result.error);
      }
    }
    setLoading(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFileName = (filePath: string): string => {
    if (!filePath) return '';
    return filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
    }
  };

  const handleDeleteFile = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedFile && onRemoveFile) {
      onRemoveFile(selectedFile);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (!selectedFile) {
    return (
      <div className="version-history">
        <div className="no-selection">
          <div className="no-selection-icon">🎯</div>
          <p>Select a file to view its version history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="version-history">
      <div className="history-header">
        <div>
          <h2>{getFileName(selectedFile)}</h2>
          <p className="file-path">{selectedFile}</p>
        </div>
      </div>

      <div className="commit-section">
        <h3>Save New Version</h3>
        <div className="commit-form">
          <input
            type="text"
            placeholder="Version message (optional - defaults to V1, V2, etc.)"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="commit-btn" onClick={handleCommit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Version'}
          </button>
        </div>
      </div>

      <div className="versions-section">
        <h3>Version History</h3>
        <div className="versions-list">
          {loading && versions.length === 0 ? (
            <div className="loading">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="empty-versions">
              <div className="empty-icon">📋</div>
              <p>No versions saved yet</p>
              <p className="empty-hint">Save your first version above</p>
            </div>
          ) : (
            versions.map((version) => (
              <div key={version.hash} className="version-card">
                <div className="version-header">
                  <div className="version-number">{version.message}</div>
                  <div className="version-actions">
                    <button
                      className="export-btn"
                      onClick={() => handleExport(version.hash, version.message)}
                      disabled={loading}
                      title="Export to separate file"
                    >
                      Export
                    </button>
                    <button
                      className="restore-btn"
                      onClick={() => handleRestore(version.hash)}
                      disabled={loading}
                    >
                      Restore
                    </button>
                  </div>
                </div>
                <div className="version-meta">
                  <span className="version-date">{formatDate(version.date)}</span>
                  <span className="version-hash-container">
                    <span className="version-hash">{version.hash.substring(0, 7)}</span>
                    <button
                      className="copy-hash-btn"
                      onClick={() => handleCopyHash(version.hash)}
                      title="Copy full hash"
                    >
                      {copiedHash === version.hash ? '✓' : '📋'}
                    </button>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {onRemoveFile && (
        <div className="delete-section">
          <button className="delete-file-btn" onClick={handleDeleteFile}>
            Delete File from Tracking
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <h3>Delete File from Tracking?</h3>
            <p>Are you sure you want to stop tracking "{getFileName(selectedFile)}"?</p>
            <p className="warning-text">This will remove all version history for this file.</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showRenameDialog && (
        <div className="rename-dialog-overlay">
          <div className="rename-dialog">
            <h3>No Changes Detected</h3>
            <p>The file hasn't changed since the last version.</p>
            <p className="info-text">Would you like to rename the last version instead?</p>
            <input
              type="text"
              placeholder="Enter new version name (optional)"
              value={renameMessage}
              onChange={(e) => setRenameMessage(e.target.value)}
              className="rename-input"
            />
            <div className="dialog-actions">
              <button className="cancel-btn" onClick={handleRenameCancel}>Cancel</button>
              <button className="confirm-rename-btn" onClick={handleRenameConfirm}>
                Rename Last Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
