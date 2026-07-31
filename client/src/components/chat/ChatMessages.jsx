function ChatMessages({ messages }) {
  return (
    <div
      style={{
        border: "1px solid gray",
        height: "300px",
        marginBottom: "10px",
        padding: "10px",
        overflowY: "auto",
      }}
    >
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from}:</strong> {msg.message}
          </div>
        ))
      )}
    </div>
  );
}

export default ChatMessages;