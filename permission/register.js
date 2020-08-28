const { Account, Role } = require("../models/Account");

const canRegister = (req, res, next) => {
  Role.findOne({ role: "operator" }).then((role) => {
    if (req.user.roleId !== role._id) {
      return res
        .status(403)
        .send("you're not allowed to registing new account");
    }
    next();
  });
};

module.exports = { canRegister };
