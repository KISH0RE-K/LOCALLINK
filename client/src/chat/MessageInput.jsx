import socket from "../socket/socket";

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
          [selectedGroup.id]: [
            ...existing,
            {
              from: "You",
              message,
            },
          ],
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
          [selectedUser.id]: [
            ...existing,
            {
              from: "You",
              message,
            },
          ],
        };
      });
    }

    setMessage("");
  };

  return (
    <>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </>
  );
}

export default MessageInput;