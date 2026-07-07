import React from 'react';
import { X } from 'lucide-react';
import './TutorialGuide.css';

interface TutorialGuideProps {
  onClose: () => void;
}

const TutorialGuide = ({ onClose }: TutorialGuideProps) => {
  return (
    <div className="tg-overlay" onClick={onClose}>
      <div className="tg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tg-header">
          <div className="tg-header-title">Getting Started Guide</div>
          <button className="tg-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="tg-body">

          <section className="tg-section">
            <h3 className="tg-section-title">What is Historidoc?</h3>
            <p>Historidoc keeps a history of your files by saving snapshots called <strong>versions</strong>. Think of them like save states in a video game — you can create one whenever you want, and go back to any of them at any time. Nothing is permanent unless you choose to delete it.</p>
            <p>There's no coding knowledge required. Historidoc works entirely behind the scenes, separate from your actual files.</p>
          </section>

          <section className="tg-section">
            <h3 className="tg-section-title">Adding Files & Folders</h3>
            <p>Drag a file into the app window, or click <strong>Add File</strong> in the top right. Historidoc starts tracking it immediately — but nothing is saved to your history until you explicitly create a version.</p>
            <p>You can also track entire folders. When you do, every version you save captures everything inside the folder as a single snapshot. This is great for projects with multiple files.</p>
          </section>

          <section className="tg-section">
            <h3 className="tg-section-title">Saving a Version</h3>
            <p>Click <strong>Save Version</strong> in the right-hand panel. You can add a message to label it — "Before big edit", "Draft 3", anything you like — or leave it blank. If you leave it blank, Historidoc numbers versions automatically: V1, V2, V3, and so on.</p>
            <p className="tg-tip">Tip: save a version <em>before</em> making a big change, not just after. That way you have a snapshot to fall back to if you change your mind.</p>
          </section>

          <section className="tg-section">
            <h3 className="tg-section-title">Restoring a Version</h3>
            <p>Click <strong>Restore</strong> on any version in the history list. You'll be given two options:</p>
            <ul className="tg-list">
              <li><strong>Remove future versions</strong> — Rewinds your history to that point. Any versions saved after it will be permanently deleted. Use this when you want to truly go back and start over from there.</li>
              <li><strong>Restore as new version</strong> — Brings back the old content but keeps your full history intact. A new version is added on top, so you can see exactly what changed and when. You can name this new version anything you like.</li>
            </ul>
            <p>You can set a default restore action in Settings so you aren't asked every time.</p>
          </section>

          <section className="tg-section">
            <h3 className="tg-section-title">Exporting a Version</h3>
            <p>Click <strong>Export</strong> on any version to save a standalone copy of that version as a separate file on your computer. Your actual file is not changed, and neither is your version history.</p>
            <p>Use export when you want to share a specific draft with someone, hand off a particular version, or keep a copy of it somewhere outside Historidoc — like sending it in an email or uploading it somewhere.</p>
          </section>

          <section className="tg-section">
            <h3 className="tg-section-title">Auto-save</h3>
            <p>Historidoc can automatically check your file on a schedule and save a version whenever something has changed. To set it up, click the <strong>gear icon ⚙</strong> in the top right of the version history panel. You can choose intervals like every 15 minutes, every hour, or every 2 hours.</p>
            <p>You can also set a default auto-save interval for all new files in App Settings (⌘,).</p>
          </section>

          <section className="tg-section">
            <h3 className="tg-section-title">Tracking Folders</h3>
            <p>When you track a folder, every version captures a snapshot of everything inside it. Restoring a folder version replaces the entire folder's contents with what they were at that point.</p>
            <p>One thing to note: folder tracking doesn't show you a line-by-line breakdown of what changed inside — you see that a snapshot was taken, but not which specific lines were different. For that level of detail, track individual files instead.</p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TutorialGuide;
