import React, { useState, useEffect } from 'react';
import { Copy, Check, Settings, ArrowLeft, Link2, ArrowRight } from 'lucide-react';
import { Version } from '../types';
import DiffViewer from './DiffViewer';
import './VersionHistory.css';

interface VersionHistoryProps {
  selectedFile: string | null;
  onUntrackFile?: (filePath: string) => void;
  onDeleteFile?: (filePath: string) => void;
}

const parseRelinkMessage = (message: string): { oldPath: string; newPath: string } | null => {
  const prefix = "Relinked from ";
  if (!message.startsWith(prefix)) return null;
  const fullRest = message.slice(prefix.length);
  // Anchor the date at the end: " on Mon DD, YYYY at HH:MM AM/PM"
  const dateMatch = fullRest.match(/ on [A-Z][a-z]+ \d+, \d{4} at \d+:\d+ [AP]M$/);
  const beforeDate = dateMatch ? fullRest.slice(0, dateMatch.index) : fullRest;
  // Paths on macOS start with /; split on " to /"
  const toMarkerIdx = beforeDate.indexOf(" to /");
  if (toMarkerIdx === -1) return null;
  return {
    oldPath: beforeDate.slice(0, toMarkerIdx),
    newPath: beforeDate.slice(toMarkerIdx + " to ".length),
  };
};

const VersionHistory = ({ selectedFile, onUntrackFile, onDeleteFile }: VersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUntrackConfirm, setShowUntrackConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameMessage, setRenameMessage] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [diffVersion, setDiffVersion] = useState<Version | null>(null);
  const [diffContent, setDiffContent] = useState('');
  const [diffLoading, setDiffLoading] = useState(false);

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
    setCommitError(null);

    const changeCheck = await window.electron.checkFileChanges(selectedFile);

    if (changeCheck.fileMissing) {
      setCommitError('This file has moved. Please re-link it from the file list before saving a version.');
      setLoading(false);
      return;
    }

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

  const confirmUntrack = () => {
    if (selectedFile && onUntrackFile) onUntrackFile(selectedFile);
    setShowUntrackConfirm(false);
  };

  const confirmDelete = () => {
    if (selectedFile && onDeleteFile) onDeleteFile(selectedFile);
    setShowDeleteConfirm(false);
  };

  const handleViewDiff = async (version: Version) => {
    if (!window.electron || !selectedFile) return;
    setDiffVersion(version);
    setDiffLoading(true);
    setDiffContent('');
    const result = await window.electron.getDiff(selectedFile, version.hash);
    setDiffContent(result.success ? result.diff : '');
    setDiffLoading(false);
  };

  const handleCloseDiff = () => {
    setDiffVersion(null);
    setDiffContent('');
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 500);
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

  if (showSettings) {
    return (
      <div className="version-history">
        <div className="history-header">
          <div>
            <h2>{getFileName(selectedFile)}</h2>
            <p className="file-path">{selectedFile}</p>
          </div>
          <button className="settings-back-btn" onClick={() => setShowSettings(false)} title="Back">
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="settings-view">
          <div className="danger-zone">
            <div className="danger-zone-title">Danger Zone</div>

            <div className="danger-action">
              <div className="danger-action-text">
                <div className="danger-action-name">Untrack File</div>
                <div className="danger-action-desc">Removes this file from tracking. Your version history is preserved — if you add it again later, it will still be there.</div>
              </div>
              <button className="untrack-btn" onClick={() => setShowUntrackConfirm(true)}>Untrack</button>
            </div>

            <div className="danger-divider" />

            <div className="danger-action">
              <div className="danger-action-text">
                <div className="danger-action-name">Delete File & All History</div>
                <div className="danger-action-desc">Permanently deletes all saved versions for this file. This cannot be undone.</div>
              </div>
              <button className="danger-delete-btn" onClick={() => setShowDeleteConfirm(true)}>Delete All</button>
            </div>
          </div>
        </div>

        {showUntrackConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <h3>Untrack File?</h3>
              <p>"{getFileName(selectedFile)}" will no longer be tracked. Your version history will be preserved.</p>
              <div className="confirm-actions">
                <button className="cancel-btn" onClick={() => setShowUntrackConfirm(false)}>Cancel</button>
                <button className="confirm-delete-btn" onClick={confirmUntrack}>Untrack</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <h3>Delete File & All History?</h3>
              <p>All saved versions for "{getFileName(selectedFile)}" will be permanently deleted.</p>
              <p className="warning-text">This cannot be undone.</p>
              <div className="confirm-actions">
                <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="confirm-delete-btn" onClick={confirmDelete}>Delete All</button>
              </div>
            </div>
          </div>
        )}
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
        <button className="settings-btn" onClick={() => setShowSettings(true)} title="File settings">
          <Settings size={18} />
        </button>
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
        {commitError && <div className="commit-error">{commitError}</div>}
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
            versions.map((version) => {
              const relinkData = parseRelinkMessage(version.message);
              if (relinkData) {
                return (
                  <div key={version.hash} className="relink-event-card">
                    <div className="relink-event-header">
                      <div className="relink-event-label">
                        <Link2 size={12} />
                        File Relinked
                      </div>
                      <div className="relink-event-date">{formatDate(version.date)}</div>
                    </div>
                    <div className="relink-event-paths">
                      <div className="relink-path-row">
                        <span className="relink-path-tag">from</span>
                        <span className="relink-path-value">{relinkData.oldPath}</span>
                      </div>
                      <div className="relink-path-row">
                        <ArrowRight size={12} className="relink-path-arrow" />
                        <span className="relink-path-value relink-path-new">{relinkData.newPath}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={version.hash} className="version-card">
                  <div className="version-header">
                    <div className="version-number">{version.message}</div>
                    <div className="version-actions">
                      <button
                        className="diff-btn"
                        onClick={() => handleViewDiff(version)}
                        disabled={loading}
                        title="View changes in this version"
                      >
                        Diff
                      </button>
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
                        {copiedHash === version.hash ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                      </button>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {diffVersion && (
        <DiffViewer
          versionMessage={diffVersion.message}
          fileName={getFileName(selectedFile)}
          diff={diffContent}
          loading={diffLoading}
          onClose={handleCloseDiff}
        />
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
