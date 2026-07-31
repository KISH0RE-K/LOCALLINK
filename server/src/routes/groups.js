const express = require("express");
const router = express.Router();

const groupService = require("../group/groupService");

// Get all groups
router.get("/", (req, res) => {
    res.json(groupService.getGroups());
});

// Create a group
router.post("/", (req, res) => {

    const { name, members, icon } = req.body;

    const group = groupService.createGroup(name, members, icon);

    res.status(201).json(group);

});

router.put("/:id", (req, res) => {

    const group = groupService.renameGroup(
        req.params.id,
        req.body.name
    );

    if (!group) {
        return res.status(404).json({
            message: "Group not found"
        });
    }

    res.json(group);

});

router.post("/:id/members", (req, res) => {

    const group = groupService.addMember(
        req.params.id,
        req.body
    );

    if (!group) {
        return res.status(404).json({
            message: "Group not found"
        });
    }

    res.json(group);

});

router.delete("/:id/members/:memberId", (req, res) => {

    const group = groupService.removeMember(
        req.params.id,
        req.params.memberId
    );

    if (!group) {
        return res.status(404).json({
            message: "Group not found"
        });
    }

    res.json(group);

});
module.exports = router;