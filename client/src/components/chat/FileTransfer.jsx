import { v4 as uuidv4 } from "uuid";
import socket from "../../socket/socket";
import JSZip from "jszip";

function FileTransfer({
  selectedUser,
  isGroupChat,
  selectedFiles,
  setSelectedFiles,
  setPendingFile,
  sendProgress,
  isPaused,
  setIsPaused,
  pauseRef,
  setTransferStatus,
}) {
  function handleFileSelect(e) {
    setSelectedFiles(Array.from(e.target.files));
  }

  async function handleFolderSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.webkitRelativePath, file);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const zippedFile = new File([blob], "Folder.zip", { type: "application/zip" });
    setSelectedFiles([zippedFile]);
  }

  const sendFile = () => {
    if (isGroupChat) return;
    const file = selectedFiles[0];
    if (!file) return;

    setPendingFile(file);
    const transferId = uuidv4();

    socket.emit("sendFileRequest", {
      transferId,
      userId: selectedUser.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  };

  if (isGroupChat) return null;

  return (
    <div className="file-panel">
      {/* File picker */}
      <label className="file-label" htmlFor="file-input">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1v8M4 6l3-3 3 3M1 11h12v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        File
        <input
          id="file-input"
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </label>

      {/* Folder picker */}
      <label className="file-label" htmlFor="folder-input">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 3a1 1 0 011-1h3l2 2h5a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Folder
        <input
          id="folder-input"
          type="file"
          style={{ display: "none" }}
          webkitdirectory=""
          multiple
          onChange={handleFolderSelect}
        />
      </label>

      {/* Selected file tag */}
      {selectedFiles.length > 0 && (
        <span className="file-selected-tag">
          📄 {selectedFiles[0].name}
        </span>
      )}

      {/* Send */}
      <button
        id="send-file-btn"
        className="file-btn file-btn-send"
        onClick={sendFile}
        disabled={selectedFiles.length === 0}
      >
        Send File
      </button>

      {/* Pause */}
      <button
        id="pause-btn"
        className="file-btn file-btn-pause"
        onClick={() => {
          setIsPaused(true);
          setTransferStatus("paused");
          pauseRef.current = true;
        }}
        disabled={isPaused || sendProgress === 0 || sendProgress === 100}
      >
        Pause
      </button>

      {/* Resume */}
      <button
        id="resume-btn"
        className="file-btn file-btn-resume"
        onClick={() => {
          setIsPaused(false);
          setTransferStatus("sending");
          pauseRef.current = false;
        }}
        disabled={!isPaused}
      >
        Resume
      </button>
    </div>
  );
}

export default FileTransfer;
