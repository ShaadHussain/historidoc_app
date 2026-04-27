import React from 'react';
import './DiffViewer.css';

interface DiffViewerProps {
  versionMessage: string;
  diff: string;
  loading: boolean;
  onClose: () => void;
}

const DiffViewer = ({ versionMessage, diff, loading, onClose }: DiffViewerProps) => {
  const renderLines = () => {
    if (loading) {
      return <div className="diff-empty">Loading diff...</div>;
    }

    if (!diff.trim()) {
      return <div className="diff-empty">No changes in this version.</div>;
    }

    const isMetaLine = (line: string) =>
      line.startsWith('diff ') ||
      line.startsWith('index ') ||
      line.startsWith('--- ') ||
      line.startsWith('+++ ') ||
      line.startsWith('@@') ||
      line.startsWith('\\ No newline');

    return diff.split('\n').filter(line => !isMetaLine(line)).map((line, i) => {
      let className = 'diff-line';
      let text = line;

      if (line.startsWith('+')) {
        className += ' diff-added';
        text = line.slice(1);
      } else if (line.startsWith('-')) {
        className += ' diff-removed';
        text = line.slice(1);
      } else if (line.startsWith(' ')) {
        text = line.slice(1);
      }

      return (
        <div key={i} className={className}>
          {text || ' '}
        </div>
      );
    });
  };

  return (
    <div className="diff-overlay" onClick={onClose}>
      <div className="diff-modal" onClick={(e) => e.stopPropagation()}>
        <div className="diff-header">
          <h3>Changes in {versionMessage}</h3>
          <button className="diff-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="diff-content">
          {renderLines()}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
