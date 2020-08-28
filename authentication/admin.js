const { Account } = require("../models/Account");

const authAdmin = (req, res, next) => {
  const email = req.user ? req.user.email : req.body.email;
  Account.findOne({ email: email })
    .populate("roleId")
    .exec((err, account) => {
      if (err) return console.log(err);

      //   check if account is null
      if (!account) return next();

      // check if account not admin
      if (!account.roleId.admin) {
        return res.status(403).json({ msg: "Not allowed" });
      }
      next();
    });
};

module.exports = { authAdmin };
