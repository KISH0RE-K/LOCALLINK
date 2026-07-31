const { v4: uuidv4 } = require("uuid");

class GroupService {
  constructor() {
    this.groups = [];
  }

  start() {
    console.log("Group Service Started");
  }
  createGroup(name, members,  icon = "👥") {
    const group = {
      id: uuidv4(),
      name,
      members,
      icon
    };

    this.groups.push(group);

    return group;
  }
  getGroups() {
    return this.groups;
  }
  renameGroup(groupId, newName) {
    const group = this.groups.find((g) => g.id === groupId);

    if (!group) {
      return null;
    }

    group.name = newName;

    return group;
  }
  addMember(groupId, member) {
    const group = this.groups.find((g) => g.id === groupId);

    if (!group) {
      return null;
    }

    const exists = group.members.some((m) => m.id === member.id);

    if (!exists) {
      group.members.push(member);
    }

    return group;
  }
  removeMember(groupId, memberId) {
    const group = this.groups.find((g) => g.id === groupId);

    if (!group) {
      return null;
    }

    group.members = group.members.filter((member) => member.id !== memberId);

    return group;
  }
}

module.exports = new GroupService();
