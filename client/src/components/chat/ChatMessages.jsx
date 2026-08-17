import { useEffect, useRef } from "react";

function ChatMessages({ messages, currentUsername }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="messages-area">
        <p className="msg-no-messages">No messages yet. Say hello! 👋</p>
      </div>
    );
  }

  return (
    <div className="messages-area">
      {messages.map((msg, index) => {
        const isOwn = msg.from === "You" || msg.from === currentUsername;
        return (
          <div key={index} className={`msg-row ${isOwn ? "outgoing" : ""}`}>
            <span className="msg-sender-avatar">
              {(msg.from || "?").charAt(0).toUpperCase()}
            </span>
            <div className="msg-content">
              {!isOwn && (
                <p className="msg-sender-name">{msg.from}</p>
              )}
              <div className="msg-bubble">{msg.message}</div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatMessages;