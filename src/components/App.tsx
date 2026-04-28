import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import FileList from "./FileList";
import VersionHistory from "./VersionHistory";
import ConfirmDialog from "./ConfirmDialog";
import "./App.css";

const App = () => {
  const [trackedFiles, setTrackedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFilePath, setPendingFilePath] = useState("");

  useEffect(() => {
    loadTrackedFiles();
  }, []);

  const loadTrackedFiles = async () => {
    if (window.electron) {
      const files = await window.electron.getTrackedFiles();
      setTrackedFiles(files);
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0]);
      }
    }
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
      await loadTrackedFiles();
      if (selectedFile === filePath) {
        setSelectedFile(trackedFiles.length > 0 ? trackedFiles[0] : null);
      }
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!window.electron) return;

    const result = await window.electron.deleteFileHistory(filePath);
    if (result.success) {
      await loadTrackedFiles();
      if (selectedFile === filePath) {
        setSelectedFile(trackedFiles.length > 0 ? trackedFiles[0] : null);
      }
    }
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
    const result = await window.electron.trackFile(filePath);
    if (result.success) {
      await loadTrackedFiles();
      setSelectedFile(filePath);
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
          <button className="add-file-btn" onClick={handleAddFile}>
            <span className="icon">+</span> Add File
          </button>
        </div>
      </div>

      <div className="main-content">
        <FileList
          trackedFiles={trackedFiles}
          selectedFile={selectedFile}
          onSelectFile={handleSelectFile}
        />
        <VersionHistory
          selectedFile={selectedFile}
          onUntrackFile={handleRemoveFile}
          onDeleteFile={handleDeleteFile}
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

      <ConfirmDialog
        show={showConfirmDialog}
        fileName={getFileName(pendingFilePath)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default App;
