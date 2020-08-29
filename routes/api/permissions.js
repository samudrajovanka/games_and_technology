const express = require("express");
const router = express.Router();

// Load model
const Permissions = require("../../models/Permissions");

// Load authentication
const { userAuth, authAdmin } = require("../../utils/auth")

// Load permission

// @route   GET api/roles
// @desc    Get All Permissions
// @acess   Private
router.get("/all", (req, res) => {
    Permissions.find()
        .then((permissions) => {
            res.json(permissions);
        });
});

// @route   POST api/roles/add
// @desc    Create an Permissions
// @acess   Private
router.post(
    "/add",
    userAuth,
    authAdmin,

    (req, res) => {
        Permissions.findOne({ permission: req.body.permission }).then((permissions) => {
            if (permissions) return res.status(400).send({ permission: "Permissions already exsist" });

            const newPermissions = new Permissions({
                permission: req.body.permission,
                roles: req.body.roles,
                desc: req.body.desc,
            });

            newPermissions
                .save()
                .then((permissions) => res.json(permissions))
                .catch((err) => console.log(err));
        });
    });

module.exports = router;
