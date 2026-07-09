import React, { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import './AppSettings.css';

interface AppSettingsProps {
  onClose: () => void;
  onOpenGuide: () => void;
  onOpenSlides: () => void;
}

const AUTO_SAVE_OPTIONS = [
  { label: 'Off', value: null },
  { label: 'Every 15 minutes', value: 15 },
  { label: 'Every 30 minutes', value: 30 },
  { label: 'Every hour', value: 60 },
  { label: 'Every 2 hours', value: 120 },
];

const currentSystemTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getTzAbbr = (ianaTimezone: string): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ianaTimezone,
    timeZoneName: 'short',
  }).formatToParts(new Date());
  return parts.find(p => p.type === 'timeZoneName')?.value || ianaTimezone;
};

const AppSettings = ({ onClose, onOpenGuide, onOpenSlides }: AppSettingsProps) => {
  const [alwaysDeleteOnStartFresh, setAlwaysDeleteOnStartFresh] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number | null>(null);
  const [timezoneDisplay, setTimezoneDisplay] = useState<string>('system');
  const [use24Hour, setUse24Hour] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'reset' | 'commit' | 'ask'>('ask');
  const [expandPathsByDefault, setExpandPathsByDefault] = useState(false);

  useEffect(() => {
    window.electron.getPreference("alwaysDeleteOnStartFresh").then((val) => {
      setAlwaysDeleteOnStartFresh(!!val);
    });
    window.electron.getPreference("autoSaveInterval").then((val) => {
      setAutoSaveInterval(val ?? null);
    });
    window.electron.getPreference("timezoneDisplay").then((val: string | null) => {
      setTimezoneDisplay(val || 'system');
    });
    window.electron.getPreference("use24HourTime").then((val) => {
      setUse24Hour(!!val);
    });
    window.electron.getPreference("restoreMode").then((val: string | null) => {
      setRestoreMode((val as 'reset' | 'commit') || 'ask');
    });
    window.electron.getPreference("expandPathsByDefault").then((val) => {
      setExpandPathsByDefault(!!val);
    });
  }, []);

  const handleRestoreModeChange = async (value: string) => {
    const mode = value as 'reset' | 'commit' | 'ask';
    setRestoreMode(mode);
    await window.electron.setPreference("restoreMode", mode === 'ask' ? null : mode);
  };

  const handleAlwaysDeleteToggle = async (checked: boolean) => {
    setAlwaysDeleteOnStartFresh(checked);
    await window.electron.setPreference("alwaysDeleteOnStartFresh", checked);
  };

  const handleTimezoneChange = async (value: string) => {
    setTimezoneDisplay(value);
    await window.electron.setPreference("timezoneDisplay", value);
  };

  const handleUse24HourToggle = async (checked: boolean) => {
    setUse24Hour(checked);
    await window.electron.setPreference("use24HourTime", checked);
  };

  const frozenTz = timezoneDisplay !== 'system' && timezoneDisplay !== 'UTC' ? timezoneDisplay : null;
  const freezeOptionValue = frozenTz || currentSystemTz;
  const freezeOptionLabel = frozenTz
    ? `Fixed: ${getTzAbbr(frozenTz)}`
    : `Freeze to current timezone`;

  const handleAutoSaveChange = async (value: string) => {
    const parsed = value === 'null' ? null : parseInt(value, 10);
    setAutoSaveInterval(parsed);
    await window.electron.setPreference("autoSaveInterval", parsed);
  };

  const handleExpandPathsToggle = async (checked: boolean) => {
    setExpandPathsByDefault(checked);
    await window.electron.setPreference("expandPathsByDefault", checked);
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
                <div className="settings-row-label">Default auto-save interval for new files</div>
                <div className="settings-row-desc">
                  When you start tracking a new file, this interval will be applied automatically. You can change it per file in each file's settings.
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
            <div className="settings-section-title">Timestamps</div>

            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">
                  Timezone for version dates
                  <span className="tz-help-icon">
                    <HelpCircle size={13} />
                    <div className="tz-help-tooltip">
                      <div className="tz-help-tooltip-title">How does Historidoc know my timezone?</div>
                      It reads the timezone already set on your Mac, the same one used by your system clock. No location tracking, no geolocation, no network requests.
                    </div>
                  </span>
                </div>
                <div className="settings-row-desc">
                  {timezoneDisplay === 'system' && 'Dates use your system clock and change if you travel.'}
                  {timezoneDisplay === 'UTC' && 'All dates are displayed in UTC.'}
                  {frozenTz && `Dates are pinned to ${frozenTz} (${getTzAbbr(frozenTz)}).`}
                </div>
              </div>
              <select
                className="settings-select"
                value={timezoneDisplay}
                onChange={(e) => handleTimezoneChange(e.target.value)}
              >
                <option value="system">System timezone (auto)</option>
                <option value="UTC">UTC</option>
                <option value={freezeOptionValue}>{freezeOptionLabel}</option>
              </select>
            </div>

            <div className="settings-row" style={{ marginTop: '1rem' }}>
              <div className="settings-row-text">
                <div className="settings-row-label">Use 24-hour time</div>
                <div className="settings-row-desc">Show timestamps in 24-hour format (e.g. 14:30) instead of 12-hour (e.g. 2:30 PM).</div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={use24Hour}
                  onChange={(e) => handleUse24HourToggle(e.target.checked)}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">Tracked Files</div>

            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">Expand file paths by default</div>
                <div className="settings-row-desc">Show the full path under each tracked file instead of collapsed. You can still expand or collapse individual files.</div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={expandPathsByDefault}
                  onChange={(e) => handleExpandPathsToggle(e.target.checked)}
                />
                <span className="settings-toggle-slider" />
              </label>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">File History</div>

            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">Default restore action</div>
                <div className="settings-row-desc">
                  Choose what happens when you click Restore on a version. "Always ask" shows the dialog each time.
                </div>
              </div>
              <select
                className="settings-select"
                value={restoreMode}
                onChange={(e) => handleRestoreModeChange(e.target.value)}
              >
                <option value="ask">Always ask</option>
                <option value="reset">Remove future versions</option>
                <option value="commit">Restore as new version</option>
              </select>
            </div>

            <div className="settings-row" style={{ marginTop: '1rem' }}>
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

          <div className="settings-section">
            <div className="settings-section-title">Help</div>
            <div className="settings-row">
              <div className="settings-row-text">
                <div className="settings-row-label">Tutorial</div>
                <div className="settings-row-desc">Replay the quick intro slides shown when you first opened Historidoc.</div>
              </div>
              <button className="settings-guide-btn" onClick={onOpenSlides}>View Slides</button>
            </div>
            <div className="settings-row" style={{ marginTop: '1rem' }}>
              <div className="settings-row-text">
                <div className="settings-row-label">Getting Started Guide</div>
                <div className="settings-row-desc">A plain-language reference covering every feature — saving, restoring, exporting, auto-save, and folders.</div>
              </div>
              <button className="settings-guide-btn" onClick={onOpenGuide}>Read Manual</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppSettings;
