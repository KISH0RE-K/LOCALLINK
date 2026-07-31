import { useEffect, useState } from "react";

function CreateGroup({ loadGroups }) {
    const [name, setName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [icon, setIcon] = useState("👥");

    useEffect(() => {
        fetch("http://localhost:3000/users")
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error(err));
    }, []);

    function toggleUser(user) {
        const exists = selectedUsers.some((u) => u.id === user.id);

        if (exists) {
            setSelectedUsers(
                selectedUsers.filter((u) => u.id !== user.id)
            );
        } else {
            setSelectedUsers([
                ...selectedUsers,
                user
            ]);
        }
    }

    async function createGroup() {
        if (!name.trim()) {
            alert("Enter a group name");
            return;
        }

        const response = await fetch("http://localhost:3000/groups", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                members: selectedUsers,
                icon,
            }),
        });

        if (response.ok) {
            await loadGroups();

            alert("Group Created");

            setName("");
            setIcon("👥");
            setSelectedUsers([]);
        } else {
            alert("Failed to create group");
        }
    }

    return (
        <div>
            <h2>Create Group</h2>

            <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Emoji"
                style={{ width: "60px", textAlign: "center" }}
            />

            <br />
            <br />

            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group Name"
            />

            <br />
            <br />

            {users.map((user) => (
                <div key={user.id}>
                    <input
                        type="checkbox"
                        checked={selectedUsers.some((u) => u.id === user.id)}
                        onChange={() => toggleUser(user)}
                    />

                    {user.username}
                </div>
            ))}

            <br />

            <button onClick={createGroup}>
                Create Group
            </button>
        </div>
    );
}

export default CreateGroup;