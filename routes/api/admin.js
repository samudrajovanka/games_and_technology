const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
moment.locale("id");

// Load Keys
const keys = require("../../config/keys");

// Load Authentication
const { userAuth, authAdmin, serializeUser } = require("../../utils/auth");

// Load checkRole
const checkRole = require("../../utils/permission");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateUpdateInput = require("../../validation/update");

// Load model
const { Account, Role } = require("../../models/Account");

// LOCATION SAVING PHOTO FOR ACCOUNT
const accountStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./accountPhoto/");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

// FILTER FILE TYPE
const fileFilter = (req, file, callback) => {
  // ACCEPT A PHOTO
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    // REJECT A PHOTO
    callback(null, false);
  }
};
// UPLOAD PHOTO SIZE
const upload = multer({
  storage: accountStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// @route   GET api/account/all
// @desc    Get All Account Admin
// @acess   Private
router.get("/all", userAuth, authAdmin, (req, res) => {
  Account.find()
    .populate("roleId")
    .exec((err, accounts) => {
      if (err) return res.send(err);
      accounts.map((account) => {
        if (account.roleId.admin) res.json(serializeUser(account));
      });
    });
});

// @route   POST api/account
// @desc    Create An Account
// @acess   Private
router.post("/register", userAuth, checkRole(["operator"]), (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // CHECK VALIDATION
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Account.findOne({ nickname: req.body.nickname }).then((account) => {
    if (account)
      return res.status(400).json({ nickname: "Nickname already exists" });

    Account.findOne({ email: req.body.email }).then((account) => {
      if (account)
        return res.status(400).json({ email: "Email already exists" });

      Role.findOne({ role: req.body.role }).then((role) => {
        if (!role) return res.status(404).send({ role: "Role not exist" });

        const newAccount = new Account({
          roleId: role._id,
          nickname: req.body.nickname,
          email: req.body.email,
          password: req.body.password,
          accountImage: {
            filename: "default_user.png",
            path: "accountPhoto\\default_user.png",
          },
          socialMedia: {
            instagram: req.body.instagram,
            twitter: req.body.twitter,
            steam: req.body.steam,
          },
        });

        SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR);
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
          bcrypt.hash(newAccount.password, salt, (err, hash) => {
            if (err) throw err;
            newAccount.password = hash;
            newAccount
              .save()
              .then((account) => res.json(account))
              .catch((err) => console.log(err));
          });
        });
      });
    });
  });
});

// @route   POST api/admin/login
// @desc    Login An Account Admin
// @acess   Public
router.post("/login", authAdmin, (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // CHECK VALIDATION
  if (!isValid) return res.status(400).json(errors);
  const email = req.body.email;
  const password = req.body.password;

  Account.findOne({ email })
    .populate("roleId")
    .then((account) => {
      // check for account
      if (!account) {
        errors.email = "Email not found";
        return res.status(404).json(errors);
      }

      // check password
      bcrypt.compare(password, account.password).then((isMatch) => {
        if (isMatch) {
          // User Matched
          const payload = {
            id: account.id,
          }; // CREATE JWT Payload

          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 3601,
              algorithm: "HS256",
            },
            (err, token) => {
              res.json({ success: true, token: "Bearer " + token });
            }
          );
        } else {
          errors.password = "Password incorrect";
          res.status(404).json(errors);
        }
      });
    });
});

// @route   GET api/admin/profile
// @desc    Get Current Account Admin
// @access   Private
router.get("/profile", userAuth, authAdmin, (req, res) => {
  Account.findById(req.user._id)
    .populate("roleId")
    .exec((err, accounts) => {
      if (err) return res.send(err);
      res.send(serializeUser(accounts));
    });
});

router.post(
  "/profile/update",
  upload.single("accountImage"),
  userAuth,
  authAdmin,
  (req, res) => {
    const { errors, isValid } = validateUpdateInput(req.body, req.user);
    if (!isValid) return res.status(400).json(errors);

    const accountUpdate = {};

    if (req.body.nickname) accountUpdate.nickname = req.body.nickname;
    if (req.body.email) accountUpdate.email = req.body.email;
    if (req.body.newPassword) accountUpdate.password = req.body.newPassword;
    if (req.body.accountImage)
      accountUpdate.accountImage = req.file.accountImage;

    accountUpdate.socialMedia = {};
    if (req.body.instagram)
      accountUpdate.socialMedia.instagram = req.body.instagram;
    if (req.body.twitter) accountUpdate.socialMedia.twitter = req.body.twitter;
    if (req.body.steam) accountUpdate.socialMedia.steam = req.body.steam;

    accountUpdate.updateAt = moment().format();
    console.log(moment().format());
    console.log(accountUpdate.updateAt);

    Account.findById(req.user._id)
      .populate("roleId")
      .then((account) => {
        if (account) {
          if (req.body.newPassword) {
            SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR);
            bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
              bcrypt.hash(accountUpdate.password, salt, (err, hash) => {
                if (err) throw err;
                accountUpdate.password = hash;
                Account.findByIdAndUpdate(
                  req.user.id,
                  { $set: accountUpdate },
                  { new: true }
                ).then((account) => res.json(account));
              });
            });
          } else if (!req.body) {
            Account.findByIdAndUpdate(
              req.user.id,
              { $set: accountUpdate },
              { new: true }
            ).then((account) => res.json(account));
          } else {
            res.status(502).json({ msg: "There is no update in your profile" });
          }
        }
      })
      .catch((err) => res.send(err));
  }
);

module.exports = router;