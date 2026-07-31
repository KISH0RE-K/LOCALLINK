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
  setTransferStatus
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

    const blob = await zip.generateAsync({
      type: "blob",
    });

    const zippedFile = new File([blob], "Folder.zip", {
      type: "application/zip",
    });

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

  return (
    <>
      <input type="file" onChange={handleFileSelect} />
      <input
        type="file"
        webkitdirectory=""
        multiple
        onChange={handleFolderSelect}
      />

      {selectedFiles.length > 0 && <p>Selected: {selectedFiles[0].name}</p>}

      <button disabled={isGroupChat} onClick={sendFile}>
        Send File
      </button>

      <button
        onClick={() => {
          setIsPaused(true);
          setTransferStatus("paused");
          pauseRef.current = true;
        }}
        disabled={isPaused || sendProgress === 0 || sendProgress === 100}
      >
        Pause
      </button>

      <button
        onClick={() => {
          setIsPaused(false);
         setTransferStatus("sending");
          pauseRef.current = false;
        }}
        disabled={!isPaused}
      >
        Resume
      </button>
    </>
  );
}

export default FileTransfer;
