const { Roles } = require("../models/Account");

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.roleId.role)) {
    return res.status(403).send({
      msg: "You don't have access",
    });
  }
  next();
};

module.exports = checkRole;
