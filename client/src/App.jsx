import { useEffect, useState } from "react";
import socket from "./socket/socket";
import OnlineUsers from "./components/OnlineUsers";
import ChatWindow from "./components/ChatWindow";
import Groups from "./components/Groups";
import CreateGroup from "./components/CreateGroup";

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const response = await fetch("http://localhost:3000/groups");
    const data = await response.json();

    setGroups(data);
  }
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    socket.on("messageReceived", (data) => {
      console.log(`${data.from}: ${data.message}`);
    });
    socket.on("fileMetadata", (data) => {
      console.log("Receiving");

      console.log(data);
    });
    return () => {
      socket.off("messageReceived");
      socket.off("fileAccepted");
      socket.off("fileMetadata");
    };
  }, []);

  return (
    <div>
      <OnlineUsers
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setSelectedGroup={setSelectedGroup}
      />

      <ChatWindow selectedUser={selectedUser} selectedGroup={selectedGroup} />

      <Groups
        groups={groups}
        setSelectedGroup={setSelectedGroup}
        setSelectedUser={setSelectedUser}
      />
      <CreateGroup loadGroups={loadGroups} />
    </div>
  );
}

export default App;
