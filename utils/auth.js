const passport = require('passport');
const { Account } = require('../models/Account');

// check login user
const userAuth = passport.authenticate('jwt', { session: false });

// make clean data user
const serializeUser = (user) => {
  return {
    _id: user._id,
    nickname: user.nickname,
    email: user.email,
    nama: user.nama,
    accountImage: {
      filename: user.accountImage.filename,
      path: user.accountImage.path,
    },
    socialMedia: user.socialMedia,
    createdAt: user.createdAt,
    updateAt: user.upadteAt,
  };
};

// check user is admin
const authAdmin = (req, res, next) => {
  // check current account is admin
  if (req.user) {
    if (!req.user.roleId.isAdmin)
      return res.status(403).json({
        success: false,
        message: 'Not allowed',
      });
  }

  next();
};

// check for login admin
const loginAdmin = (req, res, next) => {
  Account.findOne({ email: req.body.email })
    .populate('roleId')
    .exec((err, account) => {
      if (err)
        return res.status(500).json({
          status: 'error',
          error: err,
        });

      if (account)
        if (!account.roleId.isAdmin)
          // check if account not admin
          return res.status(403).json({
            success: false,
            message: 'Not allowed',
          });
    });

  next();
};

module.exports = {
  userAuth,
  serializeUser,
  authAdmin,
  loginAdmin,
};
