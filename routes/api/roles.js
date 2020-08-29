const express = require("express");
const router = express.Router();

// Load modesl
const { Role } = require("../../models/Account");

// Load authentication
const { userAuth, authAdmin } = require("../../utils/auth")

// @route   GET api/roles
// @desc    Get All Role
// @acess   Private
router.get(
  "/",
  userAuth,
  authAdmin,
  (req, res) => {
    Role.find().then((roles) => {
      res.json(roles);
    });
  });

// @route   POST api/roles/add
// @desc    Create an Role
// @acess   Private
router.post(
  "/add",
  userAuth,
  authAdmin,
  (req, res) => {
    Role.findOne({ role: req.body.role }).then((role) => {
      if (role) return res.status(400).send({ role: "Role already exsist" });

      const newRole = new Role({
        role: req.body.role,
        admin: req.body.admin,
      });

      newRole
        .save()
        .then((role) => res.json(role))
        .catch((err) => console.log(err));
    });
  });

module.exports = router;
