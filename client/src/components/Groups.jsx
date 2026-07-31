function Groups({ groups, setSelectedGroup, setSelectedUser, selectedGroup }) {
  return (
    <div>
      <p className="section-label">Groups</p>

      {groups.length === 0 ? (
        <p className="list-empty">No groups yet.</p>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            className={`list-item ${selectedGroup?.id === group.id ? "active" : ""}`}
            onClick={() => {
              setSelectedGroup(group);
              setSelectedUser(null);
            }}
          >
            <span className="list-item-avatar" style={{ fontSize: "16px" }}>
              {group.icon}
            </span>
            <span className="list-item-name">{group.name}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default Groups;
