import React, { useState } from 'react';
import { Copy, Check, ChevronUp, ChevronDown, AlertTriangle, FolderOpen } from 'lucide-react';
import './FileList.css';

interface FileListProps {
  trackedFiles: string[];
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
  missingFiles?: Set<string>;
  onRelink?: (filePath: string) => void;
  deprecatedFiles?: string[];
}

const FileList = ({ trackedFiles, selectedFile, onSelectFile, missingFiles = new Set(), onRelink, deprecatedFiles = [] }: FileListProps) => {
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
            const isMissing = missingFiles.has(filePath);
            const isDeprecated = deprecatedFiles.includes(filePath);
            return (
              <div
                key={filePath}
                className={`file-tab ${filePath === selectedFile ? 'active' : ''} ${isMissing ? 'missing' : ''} ${isDeprecated ? 'deprecated' : ''}`}
                onClick={() => onSelectFile(filePath)}
              >
                <div className="file-info">
                  <div className="file-name-row">
                    {isMissing && !isDeprecated && <AlertTriangle size={13} className="missing-icon" />}
                    <div className="file-name">{getFileName(filePath)}</div>
                    {isDeprecated && <span className="archived-badge">Archived</span>}
                  </div>
                  {isMissing && !isDeprecated ? (
                    <button
                      className="relink-btn"
                      onClick={(e) => { e.stopPropagation(); onRelink?.(filePath); }}
                    >
                      File moved — Re-link
                    </button>
                  ) : isDeprecated ? (
                    <div className="deprecated-path">{filePath}</div>
                  ) : (
                    <div className="file-path-container">
                      <button
                        className="copy-path-btn"
                        onClick={(e) => { e.stopPropagation(); window.electron.showInFolder(filePath); }}
                        title="Show in Finder"
                      >
                        <FolderOpen size={14} />
                      </button>
                      <button
                        className="copy-path-btn"
                        onClick={(e) => copyPathToClipboard(filePath, e)}
                        title="Copy full path"
                      >
                        {copiedPath === filePath ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                      </button>
                      <div className={`file-path ${isExpanded ? 'expanded' : ''}`}>
                        {filePath}
                      </div>
                      <button
                        className="toggle-path-btn"
                        onClick={(e) => togglePathExpansion(filePath, e)}
                        title={isExpanded ? 'Minimize path' : 'Expand path'}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  )}
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
