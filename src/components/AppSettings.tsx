import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AppSettings.css';

interface AppSettingsProps {
  onClose: () => void;
}

const AUTO_SAVE_OPTIONS = [
  { label: 'Off', value: null },
  { label: 'Every 15 minutes', value: 15 },
  { label: 'Every 30 minutes', value: 30 },
  { label: 'Every hour', value: 60 },
  { label: 'Every 2 hours', value: 120 },
];

const AppSettings = ({ onClose }: AppSettingsProps) => {
  const [alwaysDeleteOnStartFresh, setAlwaysDeleteOnStartFresh] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number | null>(null);

  useEffect(() => {
    window.electron.getPreference("alwaysDeleteOnStartFresh").then((val) => {
      setAlwaysDeleteOnStartFresh(!!val);
    });
    window.electron.getPreference("autoSaveInterval").then((val) => {
      setAutoSaveInterval(val ?? null);
    });
  }, []);

  const handleAlwaysDeleteToggle = async (checked: boolean) => {
    setAlwaysDeleteOnStartFresh(checked);
    await window.electron.setPreference("alwaysDeleteOnStartFresh", checked);
  };

  const handleAutoSaveChange = async (value: string) => {
    const parsed = value === 'null' ? null : parseInt(value, 10);
    setAutoSaveInterval(parsed);
    await window.electron.setPreference("autoSaveInterval", parsed);
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
            <div className="settings-section-title">Auto-Save</div>

            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">Auto-save interval</div>
                <div className="settings-row-desc">
                  Automatically save a new version if the file has changed since the last save.
                </div>
              </div>
              <select
                className="settings-select"
                value={autoSaveInterval === null ? 'null' : String(autoSaveInterval)}
                onChange={(e) => handleAutoSaveChange(e.target.value)}
              >
                {AUTO_SAVE_OPTIONS.map((opt) => (
                  <option key={String(opt.value)} value={opt.value === null ? 'null' : String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
