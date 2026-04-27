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

    return diff.split('\n').map((line, i) => {
      let className = 'diff-line';
      if (line.startsWith('+') && !line.startsWith('+++')) className += ' diff-added';
      else if (line.startsWith('-') && !line.startsWith('---')) className += ' diff-removed';
      else if (line.startsWith('@@')) className += ' diff-hunk';
      else if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) className += ' diff-meta';

      return (
        <div key={i} className={className}>
          {line || ' '}
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
