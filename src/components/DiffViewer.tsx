import React from 'react';
import './DiffViewer.css';

interface DiffViewerProps {
  versionMessage: string;
  fileName: string;
  diff: string;
  loading: boolean;
  onClose: () => void;
}

interface ParsedLine {
  type: 'context' | 'added' | 'removed';
  text: string;
  oldLineNum: number;
  newLineNum: number;
}

interface ParsedHunk {
  lines: ParsedLine[];
}

const parseDiff = (diff: string): ParsedHunk[] => {
  const hunks: ParsedHunk[] = [];
  let currentHunk: ParsedHunk | null = null;
  let oldLineNum = 0;
  let newLineNum = 0;

  for (const line of diff.split('\n')) {
    const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentHunk = { lines: [] };
      hunks.push(currentHunk);
      oldLineNum = parseInt(hunkMatch[1]);
      newLineNum = parseInt(hunkMatch[2]);
      continue;
    }

    if (!currentHunk) continue;
    if (
      line.startsWith('diff ') || line.startsWith('index ') ||
      line.startsWith('--- ') || line.startsWith('+++ ') ||
      line.startsWith('\\ No newline')
    ) continue;

    if (line.startsWith('+')) {
      currentHunk.lines.push({ type: 'added', text: line.slice(1), oldLineNum: 0, newLineNum: newLineNum++ });
    } else if (line.startsWith('-')) {
      currentHunk.lines.push({ type: 'removed', text: line.slice(1), oldLineNum: oldLineNum++, newLineNum: 0 });
    } else if (line.startsWith(' ')) {
      currentHunk.lines.push({ type: 'context', text: line.slice(1), oldLineNum: oldLineNum++, newLineNum: newLineNum++ });
    }
  }

  return hunks;
};

const DiffViewer = ({ versionMessage, fileName, diff, loading, onClose }: DiffViewerProps) => {
  const renderContent = () => {
    if (loading) return <div className="diff-empty">Loading diff...</div>;
    if (!diff.trim()) return <div className="diff-empty">No changes in this version.</div>;

    const hunks = parseDiff(diff);

    const renderSection = (type: 'added' | 'removed') => {
      const prefix = type === 'added' ? '+' : '-';
      const relevantHunks = hunks.filter(h => h.lines.some(l => l.type === type));

      if (relevantHunks.length === 0) {
        return <div className="diff-section-empty">None</div>;
      }

      return relevantHunks.map((hunk, hunkIdx) => {
        const visibleLines = hunk.lines.filter(l => l.type === 'context' || l.type === type);
        return (
          <div key={hunkIdx} className="diff-hunk-group">
            {hunkIdx > 0 && <div className="diff-hunk-separator" />}
            {visibleLines.map((line, i) => {
              const lineNum = type === 'added' ? line.newLineNum : line.oldLineNum;
              return (
                <div key={i} className={`diff-line ${line.type === type ? `diff-${type}` : 'diff-context'}`}>
                  <span className="diff-line-number">{lineNum}</span>
                  <span className="diff-line-prefix">{line.type === type ? prefix : ' '}</span>
                  <span className="diff-line-text">{line.text || ' '}</span>
                </div>
              );
            })}
          </div>
        );
      });
    };

    return (
      <>
        <div className="diff-section">
          <div className="diff-section-label diff-section-label-added">Added</div>
          {renderSection('added')}
        </div>
        <div className="diff-section">
          <div className="diff-section-label diff-section-label-removed">Deleted</div>
          {renderSection('removed')}
        </div>
      </>
    );
  };

  return (
    <div className="diff-overlay" onClick={onClose}>
      <div className="diff-modal" onClick={(e) => e.stopPropagation()}>
        <div className="diff-header">
          <div className="diff-header-text">
            <h3>Changes in {versionMessage}</h3>
            <span className="diff-filename">{fileName}</span>
          </div>
          <button className="diff-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="diff-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
