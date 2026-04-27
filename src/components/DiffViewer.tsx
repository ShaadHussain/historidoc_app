import React from 'react';
import './DiffViewer.css';

interface DiffViewerProps {
  versionMessage: string;
  diff: string;
  loading: boolean;
  onClose: () => void;
}

const isMetaLine = (line: string) =>
  line.startsWith('diff ') ||
  line.startsWith('index ') ||
  line.startsWith('--- ') ||
  line.startsWith('+++ ') ||
  line.startsWith('@@') ||
  line.startsWith('\\ No newline');

const DiffViewer = ({ versionMessage, diff, loading, onClose }: DiffViewerProps) => {
  const renderContent = () => {
    if (loading) {
      return <div className="diff-empty">Loading diff...</div>;
    }

    if (!diff.trim()) {
      return <div className="diff-empty">No changes in this version.</div>;
    }

    const lines = diff.split('\n').filter(line => !isMetaLine(line));
    const addedLines = lines.filter(l => l.startsWith('+')).map(l => l.slice(1));
    const removedLines = lines.filter(l => l.startsWith('-')).map(l => l.slice(1));

    const renderSection = (sectionLines: string[], type: 'added' | 'removed') => {
      if (sectionLines.length === 0) {
        return <div className="diff-section-empty">None</div>;
      }
      return sectionLines.map((text, i) => (
        <div key={i} className={`diff-line diff-${type}`}>
          <span className="diff-line-number">{i + 1}</span>
          <span className="diff-line-prefix">{type === 'added' ? '+' : '-'}</span>
          <span className="diff-line-text">{text || ' '}</span>
        </div>
      ));
    };

    return (
      <>
        <div className="diff-section">
          <div className="diff-section-label diff-section-label-added">Added</div>
          {renderSection(addedLines, 'added')}
        </div>
        <div className="diff-section">
          <div className="diff-section-label diff-section-label-removed">Deleted</div>
          {renderSection(removedLines, 'removed')}
        </div>
      </>
    );
  };

  return (
    <div className="diff-overlay" onClick={onClose}>
      <div className="diff-modal" onClick={(e) => e.stopPropagation()}>
        <div className="diff-header">
          <h3>Changes in {versionMessage}</h3>
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
