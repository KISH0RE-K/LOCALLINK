import { useEffect, useState } from "react";

function OnlineUsers({ selectedUser, setSelectedUser, setSelectedGroup }) {
  const [users, setUsers] = useState([]);
  

  useEffect(() => {
    const fetchUsers = () => {
      fetch("http://localhost:3000/users")
        .then((response) => response.json())
        .then((data) => setUsers(data));
    };

    fetchUsers();

    const interval = setInterval(fetchUsers, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Online Users</h2>

      {users.length === 0 ? (
        <p>No LocalLink users found on this network.</p>
      ) : (
        users.map((user) => (
          <p
            key={user.id}
            onClick={() => {
              setSelectedUser(user);
              setSelectedGroup(null);
            }}
            style={{ cursor: "pointer" }}
          >
            🟢 {user.username}
          </p>
        ))
      )}

      {selectedUser && (
        <div>
          <h3>Chatting with {selectedUser.username}</h3>
        </div>
      )}
    </div>
  );
}

export default OnlineUsers;
