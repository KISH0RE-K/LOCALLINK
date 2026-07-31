import { useEffect, useState } from "react";

function CreateGroup({ loadGroups }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [icon, setIcon] = useState("👥");

  useEffect(() => {
    if (!open) return;
    fetch("http://localhost:3000/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, [open]);

  function toggleUser(user) {
    const exists = selectedUsers.some((u) => u.id === user.id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  }

  async function createGroup() {
    if (!name.trim()) {
      alert("Enter a group name");
      return;
    }

    const response = await fetch("http://localhost:3000/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, members: selectedUsers, icon }),
    });

    if (response.ok) {
      await loadGroups();
      setName("");
      setIcon("👥");
      setSelectedUsers([]);
      setOpen(false);
    } else {
      alert("Failed to create group");
    }
  }

  return (
    <div className="create-group-section">
      <button
        id="create-group-toggle"
        className="create-group-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {open ? "Cancel" : "New Group"}
      </button>

      {open && (
        <div className="create-group-form">
          <div className="create-group-row">
            <input
              className="field-emoji"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📌"
            />
            <input
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name…"
              onKeyDown={(e) => e.key === "Enter" && createGroup()}
            />
          </div>

          {users.length > 0 && (
            <div className="checkbox-list">
              {users.map((user) => (
                <label key={user.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedUsers.some((u) => u.id === user.id)}
                    onChange={() => toggleUser(user)}
                  />
                  {user.username}
                </label>
              ))}
            </div>
          )}

          <button
            id="create-group-btn"
            className="btn-primary"
            onClick={createGroup}
          >
            Create Group
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateGroup;