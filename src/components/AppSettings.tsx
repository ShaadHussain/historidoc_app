import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AppSettings.css';

interface AppSettingsProps {
  onClose: () => void;
}

const AppSettings = ({ onClose }: AppSettingsProps) => {
  const [alwaysDeleteOnStartFresh, setAlwaysDeleteOnStartFresh] = useState(false);

  useEffect(() => {
    window.electron.getPreference("alwaysDeleteOnStartFresh").then((val) => {
      setAlwaysDeleteOnStartFresh(!!val);
    });
  }, []);

  const handleAlwaysDeleteToggle = async (checked: boolean) => {
    setAlwaysDeleteOnStartFresh(checked);
    await window.electron.setPreference("alwaysDeleteOnStartFresh", checked);
  };

  return (
    <div className="app-settings-overlay" onClick={onClose}>
      <div className="app-settings-modal" onClick={(e) => e.stopPropagation()}>

        <div className="app-settings-header">
          <div className="app-settings-title">Settings</div>
          <button className="app-settings-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="app-settings-body">
          <div className="settings-section">
            <div className="settings-section-title">File History</div>

            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">Always delete old file history after "Start Fresh"</div>
                <div className="settings-row-desc">
                  By default, starting fresh keeps the old file's history as an archived entry.
                  Enable this to permanently delete it instead.
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={alwaysDeleteOnStartFresh}
                  onChange={(e) => handleAlwaysDeleteToggle(e.target.checked)}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppSettings;
