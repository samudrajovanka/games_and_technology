const express = require("express");
const router = express.Router();
const app = express();
const multer = require("multer");
const bcrypt = require("bcrypt");
const keys = require("../../config/keys");
const jwt = require("jsonwebtoken");
const passport = require("passport");

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

// Load Authen Admin
const { authAdmin } = require("../../authentication/admin");
// Load Permis Register
const { canRegister } = require("../../permission/register");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//item Model
const roles = require("./roles");
const Post = require("../../models/Post");
const { Account, Role } = require("../../models/Account");

// @route   POST api/account
// @desc    Create An Account
// @acess   Public
router.post(
  "/register",
  passport.authenticate("jwt", { session: false }),
  authAdmin,
  canRegister,
  (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    // CHECK VALIDATION
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Account.findOne({ nickname: req.body.nickname }).then((user) => {
      if (user)
        return res.status(400).json({ nickname: "Nickname already exists" });

      Account.findOne({ email: req.body.email }).then((user) => {
        if (user)
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
                .then((user) => res.json(user))
                .catch((err) => console.log(err));
            });
          });
        });
      });
    });
  }
);

// @route   POST api/admin/login
// @desc    Login An Account Admin
// @acess   Public
router.post("/login", authAdmin, (req, res) => {
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

// @route   GET api/items
// @desc    Get All items
// @acess   Public
router.get("/", (req, res) => {
  Item.find()
    .sort({ date: -1 })
    .then((items) => res.json(items));
});

// @route   POST api/items
// @desc    Create A Post
// @acess   Public
router.post("/", (req, res) => {
  const newItem = new Item({
    name: req.body.name,
  });
  newItem.save().then((item) => res.json(item));
});

// Role
app.use("/roles", roles);

// @route   DELETE api/items:id
// @desc    DELETE A Post
// @acess   Public
router.delete("/:id", (req, res) => {
  Item.findById(req.params.id)
    .then((item) => item.remove().then(() => res.json({ success: true })))
    .catch((err) => res.status(400).json({ success: false }));
});

module.exports = router;
