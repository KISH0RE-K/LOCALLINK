import { useEffect } from "react";
import socket from "../../socket/socket";

export default function useChatSocket({
  pendingFile,
  pauseRef,

  setPendingFile,
  setSelectedFiles,

  setIncomingMetadata,

  setSendProgress,
  setReceiveProgress,

  setLastSavedFile,

  setIsPaused,

  setConversations,
  setGroupConversations,
  setTransferStatus
}) {
  async function sendChunks(buffer, transferId) {
    const CHUNK_SIZE = 64 * 1024;

    let offset = 0;

    while (offset < buffer.byteLength) {
      while (pauseRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);

      socket.emit("fileChunk", {
        transferId,
        chunk,
      });

      offset += CHUNK_SIZE;

      const progress = Math.min(
        Math.round((offset / buffer.byteLength) * 100),
        100,
      );

      setSendProgress(progress);

      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    socket.emit("fileComplete", {
      transferId,
    });
  }

  useEffect(() => {
    socket.on("messageReceived", (data) => {
      setConversations((previous) => {
        const existing = previous[data.fromId] || [];

        return {
          ...previous,

          [data.fromId]: [...existing, data],
        };
      });
    });

    socket.on("groupMessageReceived", (data) => {
      setGroupConversations((previous) => {
        const existing = previous[data.groupId] || [];

        return {
          ...previous,

          [data.groupId]: [
            ...existing,

            {
              from: data.from,

              message: data.message,
            },
          ],
        };
      });
    });

    socket.on("fileRequest", (data) => {
      const accepted = window.confirm(
        `${data.from} wants to send\n\n${data.fileName}\n\nAccept?`,
      );

      if (accepted) {
        socket.emit("acceptFileRequest", {
          transferId: data.transferId,

          fromId: data.fromId,

          fileName: data.fileName,
        });
      }
    });

    socket.on("fileAccepted", (data) => {
        setTransferStatus("sending");
      if (!pendingFile) return;
      
      const reader = new FileReader();

      reader.onload = () => {
        const buffer = reader.result;

        socket.emit("sendFileMetadata", {
          transferId: data.transferId,

          fileName: pendingFile.name,

          fileSize: pendingFile.size,

          fileType: pendingFile.type,
        });

        sendChunks(buffer, data.transferId);
      };

      reader.readAsArrayBuffer(pendingFile);
    });

    socket.on("fileMetadata", (data) => {
        setTransferStatus("receiving");
      setIncomingMetadata(data);

      setReceiveProgress(0);
    });

    socket.on("fileChunk", (data) => {
      setReceiveProgress(data.progress);
    });

    socket.on("fileComplete", (data) => {
      setLastSavedFile(data.fileName || null);

      setSendProgress(0);

      setReceiveProgress(0);

      setIsPaused(false);

      pauseRef.current = false;

      setSelectedFiles([]);

      setPendingFile(null);

      setIncomingMetadata(null);
      setTransferStatus("completed");
    });
    socket.on("disconnect", () => {
      setTransferStatus("failed");
    });

    socket.on("connect_error", () => {
      setTransferStatus("failed");
    });

    return () => {
      socket.off("messageReceived");

      socket.off("groupMessageReceived");

      socket.off("fileRequest");

      socket.off("fileAccepted");

      socket.off("fileMetadata");

      socket.off("fileChunk");

      socket.off("fileComplete");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [pendingFile]);
}
