function TransferProgress({
  sendProgress,
  receiveProgress,
  incomingMetadata,
  lastSavedFile,
  isPaused,
  transferStatus
}) {
  return (
    <>
      {sendProgress > 0 && sendProgress < 100 && (
        <p>
          Sending: {sendProgress}% {isPaused ? "(Paused)" : ""}
        </p>
        
      )}

      {incomingMetadata && receiveProgress < 100 && (
        <p>
          Receiving {incomingMetadata.fileName}: {receiveProgress}%
        </p>
      )}

      {lastSavedFile && (
        <p>✅ Saved: {lastSavedFile}</p>
      )}
      <p>Status: {transferStatus}</p>
    </>
  );
}

export default TransferProgress;