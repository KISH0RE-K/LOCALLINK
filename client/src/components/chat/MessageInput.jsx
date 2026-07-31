import socket from "../../socket/socket";

function MessageInput({
  message,
  setMessage,
  selectedUser,
  selectedGroup,
  isGroupChat,
  setConversations,
  setGroupConversations,
}) {
  const sendMessage = () => {
    if (!message.trim()) return;

    if (isGroupChat) {
      socket.emit("sendGroupMessage", {
        groupId: selectedGroup.id,
        message,
      });

      setGroupConversations((previous) => {
        const existing = previous[selectedGroup.id] || [];
        return {
          ...previous,
          [selectedGroup.id]: [...existing, { from: "You", message }],
        };
      });
    } else {
      socket.emit("sendMessage", {
        userId: selectedUser.id,
        message,
      });

      setConversations((previous) => {
        const existing = previous[selectedUser.id] || [];
        return {
          ...previous,
          [selectedUser.id]: [...existing, { from: "You", message }],
        };
      });
    }

    setMessage("");
  };

  return (
    <div className="input-bar">
      <input
        id="message-input"
        type="text"
        className="input-field"
        placeholder="Type a message…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />

      <button
        id="send-btn"
        className="send-btn"
        onClick={sendMessage}
        disabled={!message.trim()}
        aria-label="Send message"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8L14 2L8 14L7 9L2 8Z"
            fill="white"
            stroke="white"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default MessageInput;