const passport = require("passport");
const { Account } = require("../models/Account");

const userAuth = passport.authenticate("jwt", { session: false });

const serializeUser = (user) => {
  return {
    _id: user._id,
    nickname: user.nickname,
    email: user.email,
    createdAt: user.createdAt,
    updateAt: user.upadteAt,
    socialMedia: user.socialMedia,
  };
};

const authAdmin = (req, res, next) => {
  // check current account is admin
  if (req.user) {
    if (!req.user.roleId.admin)
      return res.status(403).json({
        msg: "Not allowed",
      });
  }
  // check login account
  else {
    Account.findOne({ email: req.body.email })
      .populate("roleId")
      .exec((err, account) => {
        if (err) console.log(err);

        // check if account not admin
        if (!account.roleId.admin)
          return res.status(403).json({
            msg: "Not allowed",
          });
      });
  }
  next();
};

module.exports = {
  userAuth,
  serializeUser,
  authAdmin,
};
