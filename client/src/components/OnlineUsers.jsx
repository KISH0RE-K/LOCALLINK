import { useEffect, useState } from "react";

function OnlineUsers({ selectedUser, setSelectedUser, setSelectedGroup }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = () => {
      fetch("http://localhost:3000/users")
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch(() => {});
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p className="section-label">People Online</p>

      {users.length === 0 ? (
        <p className="list-empty">No users on this network yet…</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className={`list-item ${selectedUser?.id === user.id ? "active" : ""}`}
            onClick={() => {
              setSelectedUser(user);
              setSelectedGroup(null);
            }}
          >
            <span className="list-item-avatar">
              {user.username.charAt(0).toUpperCase()}
            </span>
            <span className="list-item-name">{user.username}</span>
            <span className="list-item-dot" />
          </div>
        ))
      )}
    </div>
  );
}

export default OnlineUsers;
