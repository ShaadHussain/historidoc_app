import React, { useState } from 'react';
import './FileList.css';

interface FileListProps {
  trackedFiles: string[];
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
}

const FileList = ({ trackedFiles, selectedFile, onSelectFile }: FileListProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  };

  const getFilePath = (filePath: string): string => {
    const parts = filePath.split('/');
    parts.pop();
    return parts.join('/');
  };

  const togglePathExpansion = (filePath: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const copyPathToClipboard = async (filePath: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(filePath);
      setCopiedPath(filePath);
      setTimeout(() => setCopiedPath(null), 500);
    } catch (err) {
      console.error('Failed to copy path:', err);
    }
  };

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h2>Tracked Files</h2>
        <div className="file-count">{trackedFiles.length}</div>
      </div>

      <div className="files">
        {trackedFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>No files tracked yet</p>
            <p className="empty-hint">Click "Add File" to get started</p>
          </div>
        ) : (
          trackedFiles.map((filePath) => {
            const isExpanded = expandedPaths.has(filePath);
            return (
              <div
                key={filePath}
                className={`file-tab ${filePath === selectedFile ? 'active' : ''}`}
                onClick={() => onSelectFile(filePath)}
              >
                <div className="file-info">
                  <div className="file-name">{getFileName(filePath)}</div>
                  <div className="file-path-container">
                    <button
                      className="copy-path-btn"
                      onClick={(e) => copyPathToClipboard(filePath, e)}
                      title="Copy full path"
                    >
                      {copiedPath === filePath ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                    <div className={`file-path ${isExpanded ? 'expanded' : ''}`}>
                      {filePath}
                    </div>
                    <button
                      className="toggle-path-btn"
                      onClick={(e) => togglePathExpansion(filePath, e)}
                      title={isExpanded ? 'Minimize path' : 'Expand path'}
                    >
                      {isExpanded ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FileList;
