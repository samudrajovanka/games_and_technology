const express = require("express");
const router = express.Router();

const {Role} = require("../../models/Account");

// @route   GET api/roles
// @desc    Get All Role
// @acess   Public
router.get("/", (req, res) => {
    Role.find()
        .then(roles => {
            res.json(roles)
        })
});

// @route   POST api/roles/add
// @desc    Create an Role
// @acess   Public
router.post("/add", (req, res) => {
    Role.findOne({ role: req.body.role }).then((role) => {
        if (role) return res.status(400).send({ role: "Role already exsist" })

        const newRole = new Role({
            role: req.body.role,
        })

        newRole
            .save()
            .then((role) => res.json(role))
            .catch((err) => console.log(err))

    })
});

module.exports = router;