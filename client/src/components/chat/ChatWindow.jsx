import { useState, useRef } from "react";

import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";
import FileTransfer from "./FileTransfer";
import TransferProgress from "./TransferProgress";
import useChatSocket from "./UseChatSocket";

function ChatWindow({ selectedUser, selectedGroup, currentUsername }) {
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
    ? groupConversations[selectedGroup?.id] || []
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
    setTransferStatus,
  });

  // Empty state
  if (!selectedUser && !selectedGroup) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <p className="chat-empty-title">No conversation open</p>
          <p className="chat-empty-sub">
            Pick a person or group from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const displayName = isGroupChat
    ? `${selectedGroup.icon} ${selectedGroup.name}`
    : selectedUser.username;

  const avatarLetter = isGroupChat
    ? selectedGroup.icon
    : selectedUser.username.charAt(0).toUpperCase();

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {isGroupChat ? selectedGroup.icon : avatarLetter}
        </div>
        <div className="chat-header-info">
          <span className="chat-header-name">{displayName}</span>
          <span className="chat-header-status">Active now</span>
        </div>
      </div>

      {/* Messages */}
      <ChatMessages
        messages={currentConversation}
        currentUsername={currentUsername}
      />

      {/* Transfer progress */}
      <TransferProgress
        sendProgress={sendProgress}
        receiveProgress={receiveProgress}
        incomingMetadata={incomingMetadata}
        lastSavedFile={lastSavedFile}
        isPaused={isPaused}
        transferStatus={transferStatus}
      />

      {/* File transfer toolbar */}
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

      {/* Message input */}
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