import { useEffect, useState } from "react";
import socket from "./socket/socket";
import OnlineUsers from "./components/OnlineUsers";
import ChatWindow from "./components/chat/ChatWindow";
import Groups from "./components/Groups";
import CreateGroup from "./components/CreateGroup";
import NameEntry from "./components/NameEntry";
import "./App.css";

function App() {
  const [username, setUsername] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!username) return;
    loadGroups();
  }, [username]);

  async function loadGroups() {
    const response = await fetch("http://localhost:3000/groups");
    const data = await response.json();
    setGroups(data);
  }

  useEffect(() => {
    if (!username) return;
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    if (!username) return;
    socket.on("messageReceived", (data) => {
      console.log(`${data.from}: ${data.message}`);
    });
    socket.on("fileMetadata", (data) => {
      console.log("Receiving", data);
    });
    return () => {
      socket.off("messageReceived");
      socket.off("fileAccepted");
      socket.off("fileMetadata");
    };
  }, [username]);

  // Show onboarding screen until a name is set
  if (!username) {
    return <NameEntry onNameSet={setUsername} />;
  }

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="url(#sg)" />
              <path d="M12 26 L20 14 L28 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="12" cy="26" r="2.5" fill="white" />
              <circle cx="28" cy="26" r="2.5" fill="white" />
              <circle cx="20" cy="14" r="2.5" fill="white" />
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#7c6aff" />
                  <stop offset="100%" stopColor="#4f8aff" />
                </linearGradient>
              </defs>
            </svg>
            <span className="sidebar-app-name">LocalLink</span>
          </div>

          <div className="user-chip">
            <span className="user-chip-avatar">
              {username.charAt(0).toUpperCase()}
            </span>
            <span className="user-chip-name">{username}</span>
          </div>
        </div>

        <div className="sidebar-body">
          <OnlineUsers
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setSelectedGroup={setSelectedGroup}
          />

          <Groups
            groups={groups}
            setSelectedGroup={setSelectedGroup}
            setSelectedUser={setSelectedUser}
            selectedGroup={selectedGroup}
          />

          <CreateGroup loadGroups={loadGroups} />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-area">
        <ChatWindow
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          currentUsername={username}
        />
      </main>
    </div>
  );
}

export default App;
