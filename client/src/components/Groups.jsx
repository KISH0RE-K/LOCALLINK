function Groups({ groups, setSelectedGroup, setSelectedUser }) {
  return (
    <div>
      <h2>Groups</h2>

      {groups.length === 0 ? (
        <p>No groups created.</p>
      ) : (
        groups.map((group) => (
          <p
            key={group.id}
            onClick={() => {
              setSelectedGroup(group);
              setSelectedUser(null);
            }}
            style={{ cursor: "pointer" }}
          >
            {group.icon} {group.name}
          </p>
        ))
      )}
    </div>
  );
}

export default Groups;
