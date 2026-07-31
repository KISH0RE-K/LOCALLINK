function TransferProgress({
  sendProgress,
  receiveProgress,
  incomingMetadata,
  lastSavedFile,
  isPaused,
  transferStatus,
}) {
  const showSend = sendProgress > 0 && sendProgress < 100;
  const showReceive = incomingMetadata && receiveProgress < 100;

  if (!showSend && !showReceive && !lastSavedFile && transferStatus === "idle") {
    return null;
  }

  const statusClass = `transfer-status-pill status-${transferStatus}`;

  return (
    <div className="transfer-bar">
      <div className="transfer-label">
        <span className="file-saved-toast">
          {lastSavedFile && `✅ Saved: ${lastSavedFile}`}
        </span>
        <span className={statusClass}>
          {transferStatus === "sending"   && "⬆ Sending"}
          {transferStatus === "receiving" && "⬇ Receiving"}
          {transferStatus === "completed" && "✓ Done"}
          {transferStatus === "paused"    && "⏸ Paused"}
          {transferStatus === "failed"    && "✕ Failed"}
        </span>
      </div>

      {showSend && (
        <>
          <div className="transfer-label">
            <span>Sending file…{isPaused ? " (paused)" : ""}</span>
            <span>{sendProgress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${sendProgress}%` }} />
          </div>
        </>
      )}

      {showReceive && (
        <>
          <div className="transfer-label">
            <span>Receiving {incomingMetadata.fileName}…</span>
            <span>{receiveProgress}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${receiveProgress}%`,
                background: "linear-gradient(90deg, #4ade80, #22c55e)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default TransferProgress;