import React, { useState, useEffect, useRef } from "react";
import { Info, Settings } from "lucide-react";
import FileList from "./FileList";
import VersionHistory from "./VersionHistory";
import ConfirmDialog from "./ConfirmDialog";
import RelinkDialog from "./RelinkDialog";
import FileMissingToasts from "./FileMissingToasts";
import StartFreshPreserveDialog from "./StartFreshPreserveDialog";
import AppSettings from "./AppSettings";
import OverlapWarningDialog from "./OverlapWarningDialog";
import "./App.css";

const App = () => {
  const [trackedFiles, setTrackedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFilePath, setPendingFilePath] = useState("");
  const [missingFiles, setMissingFiles] = useState<Set<string>>(new Set());
  const [relinkTargetPath, setRelinkTargetPath] = useState<string | null>(null);
  const [toastFiles, setToastFiles] = useState<string[]>([]);
  const [deprecatedFiles, setDeprecatedFiles] = useState<string[]>([]);
  const [showStartFreshPreserveDialog, setShowStartFreshPreserveDialog] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState<{ newPath: string; overlappingPaths: string[] } | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const suppressMovePromptRef = useRef(false);
  const deprecatedFilesRef = useRef<string[]>([]);
  const isResizingRef = useRef(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(0);

  useEffect(() => {
    loadTrackedFiles();

    window.electron.getPreference("suppressMovePrompt").then((val) => {
      suppressMovePromptRef.current = !!val;
    });

    window.electron.onFileMissing((filePath) => {
      if (deprecatedFilesRef.current.includes(filePath)) return;
      setMissingFiles((prev) => new Set([...prev, filePath]));
      setToastFiles((prev) => prev.includes(filePath) ? prev : [...prev, filePath]);
      if (!suppressMovePromptRef.current) {
        setRelinkTargetPath(filePath);
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = e.clientX - resizeStartXRef.current;
      const newWidth = Math.max(200, Math.min(600, resizeStartWidthRef.current + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const loadTrackedFiles = async (): Promise<string[]> => {
    if (!window.electron) return [];
    const files = await window.electron.getTrackedFiles();
    setTrackedFiles(files);
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }

    const deprecated: string[] = (await window.electron.getPreference("deprecatedFiles")) || [];
    setDeprecatedFiles(deprecated);
    deprecatedFilesRef.current = deprecated;

    const activeFiles = files.filter((f) => !deprecated.includes(f));
    const missing = await window.electron.checkMissingFiles(activeFiles);
    setMissingFiles(new Set(missing));
    return files;
  };

  const handleAddFile = async () => {
    if (!window.electron) return;

    const filePath = await window.electron.selectFile();
    if (filePath) {
      const result = await window.electron.trackFile(filePath);
      if (result.success) {
        await loadTrackedFiles();
        setSelectedFile(filePath);
      }
    }
  };

  const handleRemoveFile = async (filePath: string) => {
    if (!window.electron) return;

    const result = await window.electron.removeTrackedFile(filePath);
    if (result.success) {
      const fresh = await loadTrackedFiles();
      if (selectedFile === filePath) {
        const remaining = fresh.filter((f) => f !== filePath);
        setSelectedFile(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!window.electron) return;

    const result = await window.electron.deleteFileHistory(filePath);
    if (result.success) {
      const fresh = await loadTrackedFiles();
      if (selectedFile === filePath) {
        const remaining = fresh.filter((f) => f !== filePath);
        setSelectedFile(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  const dismissToast = (filePath: string) => {
    setToastFiles((prev) => prev.filter((f) => f !== filePath));
  };

  const handleSeeDetails = (filePath: string) => {
    dismissToast(filePath);
    setRelinkTargetPath(filePath);
  };

  const handleRelink = async (oldPath: string, newPath: string): Promise<{ success: boolean; error?: string }> => {
    if (!window.electron) return { success: false };
    const result = await window.electron.relinkFile(oldPath, newPath);
    if (result.success) {
      setRelinkTargetPath(null);
      setMissingFiles((prev) => { const s = new Set(prev); s.delete(oldPath); return s; });
      dismissToast(oldPath);
      await loadTrackedFiles();
      setSelectedFile(newPath);
    }
    return result;
  };

  const handleStartFresh = async (oldPath: string, newPath: string) => {
    if (!window.electron) return;
    const result = await window.electron.startFresh(oldPath, newPath);
    if (result.success) {
      setRelinkTargetPath(null);
      setMissingFiles((prev) => { const s = new Set(prev); s.delete(oldPath); return s; });
      dismissToast(oldPath);
      await loadTrackedFiles();
      setSelectedFile(newPath);
      if (result.preserved) {
        setShowStartFreshPreserveDialog(true);
      }
    }
  };

  const handleStartFreshPreserveDismiss = async (alwaysDelete: boolean) => {
    if (alwaysDelete) {
      await window.electron.setPreference("alwaysDeleteOnStartFresh", true);
    }
    setShowStartFreshPreserveDialog(false);
  };

  const handleSuppressMovePrompt = () => {
    suppressMovePromptRef.current = true;
    window.electron.setPreference("suppressMovePrompt", true);
  };

  const handleSelectFile = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!window.electron) {
      console.error("window.electron not available");
      return;
    }

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      const file = files[0] as File & { path?: string };
      const filePath = file.path;

      if (!filePath) {
        console.error("No file path available");
        alert(
          "Error: Could not get file path. Make sure you are dragging a file from your file system.",
        );
        return;
      }

      setPendingFilePath(filePath);

      const autoConfirm =
        await window.electron.getPreference("autoConfirmDrop");

      if (autoConfirm) {
        await trackFile(filePath);
        setPendingFilePath("");
      } else {
        setShowConfirmDialog(true);
      }
    }
  };

  const handleConfirm = async (dontAskAgain: boolean) => {
    if (dontAskAgain) {
      await window.electron.setPreference("autoConfirmDrop", true);
    }

    await trackFile(pendingFilePath);
    setPendingFilePath("");
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setPendingFilePath("");
    setShowConfirmDialog(false);
  };

  const trackFile = async (filePath: string) => {
    const normalised = filePath.endsWith('/') ? filePath : filePath + '/';
    const overlapping = trackedFiles.filter((existing) => {
      const existingNormalised = existing.endsWith('/') ? existing : existing + '/';
      return existing !== filePath &&
        (filePath.startsWith(existingNormalised) || existing.startsWith(normalised));
    });

    const result = await window.electron.trackFile(filePath);
    if (result.success) {
      await loadTrackedFiles();
      setSelectedFile(filePath);
      if (overlapping.length > 0) {
        setOverlapWarning({ newPath: filePath, overlappingPaths: overlapping });
      }
    }
  };

  const getFileName = (path: string): string => {
    return path.split("/").pop() || path.split("\\").pop() || path;
  };

  return (
    <div
      className={`app ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="header">
        <h1>Version Tracker</h1>
        <div className="header-actions">
          <div className="info-tooltip-wrapper">
            <Info className="info-icon" size={18} />
            <div className="info-tooltip">
              Folders can be tracked too — ideal for whole-project snapshots. For line-by-line change history, track individual files instead.
            </div>
          </div>
          <button className="header-settings-btn" onClick={() => setShowAppSettings(true)} title="App settings">
            <Settings size={17} />
          </button>
          <button className="add-file-btn" onClick={handleAddFile}>
            <span className="icon">+</span> Add File
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="sidebar-pane" style={{ width: sidebarWidth }}>
          <FileList
            trackedFiles={trackedFiles}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            missingFiles={missingFiles}
            onRelink={(filePath) => setRelinkTargetPath(filePath)}
            deprecatedFiles={deprecatedFiles}
          />
        </div>
        <div className="resize-divider" onMouseDown={handleDividerMouseDown} />
        <VersionHistory
          selectedFile={selectedFile}
          onUntrackFile={handleRemoveFile}
          onDeleteFile={handleDeleteFile}
          isArchived={!!selectedFile && deprecatedFiles.includes(selectedFile)}
        />
      </div>

      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-message">
            <div className="drop-icon">📁</div>
            <div className="drop-text">Drop file to track</div>
          </div>
        </div>
      )}

      <FileMissingToasts
        toastFiles={toastFiles}
        onDismiss={dismissToast}
        onSeeDetails={handleSeeDetails}
      />

      {relinkTargetPath && (
        <RelinkDialog
          missingFilePath={relinkTargetPath}
          onRelink={handleRelink}
          onStartFresh={handleStartFresh}
          onDismiss={() => setRelinkTargetPath(null)}
          onSuppressMovePrompt={handleSuppressMovePrompt}
        />
      )}

      <ConfirmDialog
        show={showConfirmDialog}
        fileName={getFileName(pendingFilePath)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {showStartFreshPreserveDialog && (
        <StartFreshPreserveDialog onDismiss={handleStartFreshPreserveDismiss} />
      )}

      {showAppSettings && (
        <AppSettings onClose={() => setShowAppSettings(false)} />
      )}

      {overlapWarning && (
        <OverlapWarningDialog
          newPath={overlapWarning.newPath}
          overlappingPaths={overlapWarning.overlappingPaths}
          onDismiss={() => setOverlapWarning(null)}
        />
      )}
    </div>
  );
};

export default App;
