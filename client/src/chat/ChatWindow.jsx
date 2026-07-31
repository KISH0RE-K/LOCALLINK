import { useState, useRef } from "react";

import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import FileTransfer from "./FileTransfer";
import TransferProgress from "./TransferProgress";
import useChatSocket from "./useChatSocket";

function ChatWindow({ selectedUser, selectedGroup }) {
  const [conversations, setConversations] = useState({});
  const [groupConversations, setGroupConversations] = useState({});
  const [message, setMessage] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);

  const [incomingMetadata, setIncomingMetadata] = useState(null);

  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);

  const [lastSavedFile, setLastSavedFile] = useState(null);

  const [isPaused, setIsPaused] = useState(false);

  const pauseRef = useRef(false);

  const isGroupChat = selectedGroup !== null;
  const [transferStatus, setTransferStatus] = useState("idle");

  const currentConversation = isGroupChat
    ? groupConversations[selectedGroup.id] || []
    : conversations[selectedUser?.id] || [];

  useChatSocket({
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

    transferStatus,

    setTransferStatus
  });

  if (!selectedUser && !selectedGroup) {
    return (
      <div>
        <h2>Select a user or a group to start chatting</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>
        {isGroupChat
          ? `Group: ${selectedGroup.name}`
          : `Chat with ${selectedUser.username}`}
      </h2>

      <ChatMessages messages={currentConversation} />

      <TransferProgress
        sendProgress={sendProgress}
        receiveProgress={receiveProgress}
        incomingMetadata={incomingMetadata}
        lastSavedFile={lastSavedFile}
        isPaused={isPaused}
        transferStatus={transferStatus}
      />

      <FileTransfer
        selectedUser={selectedUser}
        isGroupChat={isGroupChat}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        setPendingFile={setPendingFile}
        sendProgress={sendProgress}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        pauseRef={pauseRef}
        setTransferStatus={setTransferStatus}

      />

      <MessageInput
        message={message}
        setMessage={setMessage}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        isGroupChat={isGroupChat}
        setConversations={setConversations}
        setGroupConversations={setGroupConversations}
      />
    </div>
  );
}

export default ChatWindow;