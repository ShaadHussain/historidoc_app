import React, { useState } from 'react';
import { Save, RotateCcw, FileOutput, Timer, FolderOpen } from 'lucide-react';
import './TutorialModal.css';

interface TutorialModalProps {
  onClose: () => void;
}

const TOTAL_SLIDES = 3;

const Slide0 = () => (
  <div className="tm-slide">
    <div className="tm-welcome-icon">📸</div>
    <h2 className="tm-slide-title">Welcome to Historidoc</h2>
    <p className="tm-tagline">Think of it like <strong>save states in a video game</strong>.</p>
    <p className="tm-body">
      Whenever you want to capture your work, save a version — a snapshot of your file exactly as it is right now.
      You can go back to any version at any time. Nothing is ever lost unless you choose to remove it.
    </p>
    <p className="tm-body">
      No coding knowledge needed. No setup required. Just add a file and start saving.
    </p>
  </div>
);

const Slide1 = () => (
  <div className="tm-slide">
    <h2 className="tm-slide-title">Saving, Restoring & Exporting</h2>
    <div className="tm-concepts">
      <div className="tm-concept">
        <div className="tm-concept-icon tm-icon-save"><Save size={17} /></div>
        <div className="tm-concept-body">
          <div className="tm-concept-name">Save</div>
          <div className="tm-concept-desc">Captures your file right now and adds it to your history. Add a label or leave it blank — Historidoc numbers versions automatically.</div>
        </div>
      </div>
      <div className="tm-concept">
        <div className="tm-concept-icon tm-icon-restore"><RotateCcw size={17} /></div>
        <div className="tm-concept-body">
          <div className="tm-concept-name">Restore</div>
          <div className="tm-concept-desc">Brings your file back to a past version. You can erase the versions that came after, or keep all of them and add this as a new save on top.</div>
        </div>
      </div>
      <div className="tm-concept">
        <div className="tm-concept-icon tm-icon-export"><FileOutput size={17} /></div>
        <div className="tm-concept-body">
          <div className="tm-concept-name">Export</div>
          <div className="tm-concept-desc">Saves a copy of any past version as a separate file on your computer — for sharing or archiving. Your actual file stays untouched.</div>
        </div>
      </div>
    </div>
  </div>
);

const Slide2 = () => (
  <div className="tm-slide">
    <h2 className="tm-slide-title">Auto-save & Folders</h2>
    <div className="tm-concepts">
      <div className="tm-concept">
        <div className="tm-concept-icon tm-icon-autosave"><Timer size={17} /></div>
        <div className="tm-concept-body">
          <div className="tm-concept-name">Auto-save</div>
          <div className="tm-concept-desc">Historidoc can automatically save a version whenever your file changes, on a schedule you choose. Set it per file using the gear icon ⚙ in the version history panel.</div>
        </div>
      </div>
      <div className="tm-concept">
        <div className="tm-concept-icon tm-icon-folder"><FolderOpen size={17} /></div>
        <div className="tm-concept-body">
          <div className="tm-concept-name">Folders</div>
          <div className="tm-concept-desc">You can track entire folders too — great for projects with multiple files. Every save captures everything inside as a single snapshot you can restore all at once.</div>
        </div>
      </div>
    </div>
  </div>
);

const TutorialModal = ({ onClose }: TutorialModalProps) => {
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = (index: number) => {
    if (index === slide || fading) return;
    setFading(true);
    setTimeout(() => {
      setSlide(index);
      setFading(false);
    }, 140);
  };

  const isLast = slide === TOTAL_SLIDES - 1;

  return (
    <div className="tm-overlay">
      <div className="tm-modal">
        <div className="tm-dots">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              className={`tm-dot${i === slide ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className={`tm-content${fading ? ' fading' : ''}`}>
          {slide === 0 && <Slide0 />}
          {slide === 1 && <Slide1 />}
          {slide === 2 && <Slide2 />}
        </div>

        <div className="tm-actions">
          <div>
            {slide > 0 && (
              <button className="tm-back-btn" onClick={() => goTo(slide - 1)}>Back</button>
            )}
          </div>
          <div>
            {isLast
              ? <button className="tm-done-btn" onClick={onClose}>Got it</button>
              : <button className="tm-next-btn" onClick={() => goTo(slide + 1)}>Next</button>
            }
          </div>
        </div>

        {isLast && (
          <div className="tm-settings-note">
            You can revisit this guide anytime in Settings (⌘,)
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialModal;
