const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load Account and Role Model
const { Account, Role } = require("../../models/Account");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load authentication
const { userAuth, serializeUser } = require("../../utils/auth")

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

// @route   GET api/cccounts
// @desc    Get All Accounts member
// @acess   Public
router.get("/all", (req, res) => {
  Account.find()
    .populate("roleId")
    .exec((err, accounts) => {
      if (err) return res.send(err)
      accounts.map(account => {
        if (!account.roleId.admin) res.json(account)
      })
    })
});

// @route   POST api/account
// @desc    Create An Account
// @acess   Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  Account.findOne({ nickname: req.body.nickname }).then((user) => {
    if (user) return res.status(400).json({
      nickname: "Nickname already exists",
      success: false
    });

    Account.findOne({ email: req.body.email }).then((user) => {
      if (user) return res.status(400).json({
        email: "Email already exists",
        success: false
      });

      Role.findOne({ role: "member" }).then((role) => {
        if (!role) return res.status(404).send({
          role: "Role not exist",
          success: false
        });

        const newAccount = new Account({
          roleId: role._id,
          nickname: req.body.nickname,
          email: req.body.email,
          password: req.body.password,
          accountImage: {
            filename: "default_user.png",
            path: "accountPhoto\\default_user.png",
          },
        });

        SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR);
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
          bcrypt.hash(newAccount.password, salt, (err, hash) => {
            if (err) throw err;
            newAccount.password = hash;
            newAccount
              .save()
              .then((user) => res.json(user))
              .catch((err) => res.send({
                success: false,
                err: err
              }));
          });
        });
      });
    });
  });
});

// @route   POST api/account
// @desc    Login An Account
// @acess   Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const email = req.body.email;
  const password = req.body.password;

  Account.findOne({ email }).then((user) => {
    // check for user
    if (!user) {
      errors.email = "Email not found";
      return res.status(404).json(errors);
    }

    // check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: user.id,
        }; // CREATE JWT Payload

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 3601,
            algorithm: "HS256",
          }, (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        res.status(404).json(errors);
      }
    });
  });
});

// @route   POST api/account/current
// @desc    Return current account
// @acess   Private
router.get(
  "/current",
  userAuth,
  (req, res) => {
    res.json({
      serializeUser
    });
  }
);

// ! That has not been completed
// @route   DELETE api/account:id
// @desc    DELETE An Account
// @acess   Public
router.delete(
  "/delete/:id",
  userAuth,
  (req, res) => {
    Account.findById(req.params.id)
      .then((account) =>
        account
          .remove()
          .then(() => res.status(400).json("Account berhasil dihapus"))
      )
      .catch((err) => res.status(400).json("Account gagal dihapus"));
  });

module.exports = router;
