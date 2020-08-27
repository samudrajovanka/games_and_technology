const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
SALT_WORK_FACTOR = 10;

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

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load Account and Role Model
const { Account, Role } = require("../../models/Account");

// @route   GET api/cccounts
// @desc    Get All Accounts
// @acess   Public
router.get("/", (req, res) => {
  Account.find()
    .populate("roleId")
    .then((accounts) => res.json(accounts))
    .catch((err) => res.send(err))
});

// @route   POST api/account
// @desc    Create An Account
// @acess   Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // CHECK VALIDATION
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Account.findOne({ nickname: req.body.nickname }).then((user) => {
    if (user) return res.status(400).json({ nickname: "Nickname already exists" });

    Account.findOne({ email: req.body.email }).then((user) => {
      if (user) return res.status(400).json({ email: "Email already exists" });

      // check role
      role = req.body.role === undefined ? "admin" : req.body.role
      Role.findOne({ role: role }).then((role) => {

        if (!role) return res.status(404).send({ role: "Role not exist" })

        const newAccount = new Account({
          roleId: role._id,
          nickname: req.body.nickname,
          email: req.body.email,
          password: req.body.password,
          accountImage: {
            filename: "default_user.png",
            path: "accountPhoto\\default_user.png"
          },
          socialMedia: {
            instagram: req.body.instagram,
            twitter: req.body.twitter,
            steam: req.body.steam
          },
        });

        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
          bcrypt.hash(newAccount.password, salt, (err, hash) => {
            if (err) throw err;
            newAccount.password = hash;
            newAccount
              .save()
              .then((user) => res.json(user))
              .catch((err) => console.log(err));
          });
        });
      })
    })
  });
});

// @route   POST api/account
// @desc    Login An Account
// @acess   Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // CHECK VALIDATION
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
          nickname: user.nickname,
          accountImage: user.accountImage,
        }; // CREATE JWT Payload

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
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

// @route   POST api/account/current
// @desc    Return current account
// @acess   Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      nickname: req.user.nickname,
      email: req.user.email,
    });
  }
);

// @route   DELETE api/account:id
// @desc    DELETE An Account
// @acess   Public
router.delete("/delete/:id", (req, res) => {
  Account.findById(req.params.id)
    .then((account) =>
      account
        .remove()
        .then(() => res.status(400).json("Account berhasil dihapus"))
    )
    .catch((err) => res.status(400).json("Account gagal dihapus"));
});

module.exports = router;
