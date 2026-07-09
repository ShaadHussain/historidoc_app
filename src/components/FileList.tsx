import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import './FileList.css';

interface FileListProps {
  trackedFiles: string[];
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
  missingFiles?: Set<string>;
  onRelink?: (filePath: string) => void;
  deprecatedFiles?: string[];
  expandPathsByDefault?: boolean;
}

const FileList = ({ trackedFiles, selectedFile, onSelectFile, missingFiles = new Set(), onRelink, deprecatedFiles = [], expandPathsByDefault = false }: FileListProps) => {
  const [pathOverrides, setPathOverrides] = useState<Record<string, boolean>>({});
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const scroll = scrollRef.current;
    if (!panel || !scroll) return;

    let accumulated = 0;
    let timer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = scroll;
      const atTop = scrollTop <= 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      if (atTop || atBottom) {
        e.preventDefault();
        accumulated += e.deltaY;
        accumulated = Math.max(-80, Math.min(80, accumulated));
        scroll.style.transition = 'none';
        scroll.style.transform = `translateY(${-accumulated * 0.2}px)`;
        clearTimeout(timer);
        timer = setTimeout(() => {
          scroll.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          scroll.style.transform = '';
          accumulated = 0;
        }, 80);
      } else if (accumulated !== 0) {
        scroll.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        scroll.style.transform = '';
        accumulated = 0;
      }
    };

    panel.addEventListener('wheel', onWheel, { passive: false });
    return () => { panel.removeEventListener('wheel', onWheel); clearTimeout(timer); };
  }, []);

  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
  };

  const getFilePath = (filePath: string): string => {
    const parts = filePath.split('/');
    parts.pop();
    return parts.join('/');
  };

  const togglePathExpansion = (filePath: string, event: React.MouseEvent, currentlyExpanded: boolean) => {
    event.stopPropagation();
    setPathOverrides(prev => ({ ...prev, [filePath]: !currentlyExpanded }));
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
    <div className="file-list" ref={panelRef}>
      <div className="file-list-header">
        <h2>Tracked Files</h2>
        <div className="file-count">{trackedFiles.length}</div>
      </div>

      <div className="files" ref={scrollRef}>
        {trackedFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>No files tracked yet</p>
            <p className="empty-hint">Click "Add File" to get started</p>
          </div>
        ) : (
          trackedFiles.map((filePath) => {
            const isExpanded = pathOverrides[filePath] ?? expandPathsByDefault;
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
                        onClick={(e) => copyPathToClipboard(filePath, e)}
                        title="Copy full path"
                      >
                        {copiedPath === filePath ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                      </button>
                      <div
                        className={`file-path ${isExpanded ? 'expanded' : ''}`}
                        onDoubleClick={(e) => { if (!isExpanded) togglePathExpansion(filePath, e, isExpanded); }}
                      >
                        {filePath}
                      </div>
                      <button
                        className="toggle-path-btn"
                        onClick={(e) => togglePathExpansion(filePath, e, isExpanded)}
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
