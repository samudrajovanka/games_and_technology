const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load Keys
const keys = require('../../config/keys');

// Load Authentication
const { userAuth, authAdmin, serializeUser } = require('../../utils/auth');

// Load checkRole
const checkRole = require('../../utils/permission');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateUpdateInput = require('../../validation/update');

// Load model
const { Account, Role } = require('../../models/Account');

// Load Upload Image
const uploadImage = require('../../utils/uploadImage');

// @route   POST api/admin/login
// @desc    Login An Account Admin
// @acess   Public
router.post('/login', authAdmin, (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // CHECK VALIDATION
  if (!isValid) return res.status(400).json(errors);
  const email = req.body.email;
  const password = req.body.password;

  Account.findOne({ email })
    .populate('roleId')
    .then((account) => {
      // check for account
      if (!account) {
        errors.email = 'Email not found';
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
              algorithm: 'HS256',
            },
            (err, token) => {
              res.json({ success: true, token: 'Bearer ' + token });
            }
          );
        } else {
          errors.password = 'Password incorrect';
          res.status(404).json(errors);
        }
      });
    });
});

// @route   POST api/account
// @desc    Create An Account
// @acess   Private
router.post('/register', userAuth, checkRole(['operator']), (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // CHECK VALIDATION
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Account.findOne({ nickname: req.body.nickname }).then((account) => {
    if (account)
      return res.status(400).json({ nickname: 'Nickname already exists' });

    Account.findOne({ email: req.body.email }).then((account) => {
      if (account)
        return res.status(400).json({ email: 'Email already exists' });

      Role.findOne({ role: req.body.role }).then((role) => {
        if (!role) return res.status(404).send({ role: 'Role not exist' });

        const newAccount = new Account({
          roleId: role._id,
          nickname: req.body.nickname,
          email: req.body.email,
          password: req.body.password,
          accountImage: {
            filename: 'default_user.png',
            path: 'static/image/default_user.png',
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

// @route   GET api/admin/all
// @desc    Get All Account Admin
// @acess   Private
router.get('/all', userAuth, authAdmin, (req, res) => {
  Account.find()
    .populate('roleId')
    .exec((err, accounts) => {
      if (err) return res.send(err);
      if (accounts) {
        const accountsAdmin = accounts.filter((account) => {
          return account.roleId.isAdmin;
        });

        if (accountsAdmin.length !== 0) {
          const accountAdminSerialize = accountsAdmin.map((accountAdmin) => {
            return serializeUser(accountAdmin);
          });
          res.json(accountAdminSerialize);
        } else {
          res.json({
            msg: 'No admin',
          });
        }
      } else {
        res.json({
          msg: 'No admin',
        });
      }
    });
});

// @route    GET api/admin/profile/:id
// @desc     Get Account Admin
// @access   Public
router.get('/profile/:id', (req, res) => {
  Account.findById(req.params.id)
    .populate('roleId')
    .exec((err, account) => {
      if (err)
        return res.json({
          msg: 'Account not found',
        });

      if (account) res.send(serializeUser(account));
    });
});

// @route    PUT api/admin/profile/update/:id
// @desc     Update Account current Admin
// @access   Private
router.put(
  '/profile/update/:id',
  userAuth,
  authAdmin,
  uploadImage.single('static'),
  (req, res) => {
    const { errors, isValid } = validateUpdateInput(req.body, req.user);
    if (!isValid) return res.status(400).json(errors);

    const accountUpdate = {};

    if (req.body.nickname) accountUpdate.nickname = req.body.nickname;
    if (req.body.email) accountUpdate.email = req.body.email;
    if (req.body.newPassword) accountUpdate.password = req.body.newPassword;

    if (req.file) accountUpdate.accountImage = req.file;

    accountUpdate.socialMedia = {};
    if (req.body.instagram)
      accountUpdate.socialMedia.instagram = req.body.instagram;
    if (req.body.twitter) accountUpdate.socialMedia.twitter = req.body.twitter;
    if (req.body.steam) accountUpdate.socialMedia.steam = req.body.steam;

    accountUpdate.updateAt = Date.now();

    Account.findById(req.user._id)
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
          } else if (req.body) {
            Account.findByIdAndUpdate(
              req.user.id,
              { $set: accountUpdate },
              { new: true }
            ).then((account) => res.json(account));
          } else {
            res.status(502).json({ msg: 'There is no update in your profile' });
          }
        }
      })
      .catch((err) => res.send(err));
  }
);

// @route   DELETE api/admin/profile/delete/:id
// @desc    DELETE An Account admin
// @acess   Private
router.delete(
  '/profile/delete/:id',
  userAuth,
  authAdmin,
  checkRole(['operator']),
  (req, res) => {
    Account.findById(req.params.id)
      .then((account) => {
        if (!account)
          return res.status(404).json({ account: 'account not found' });

        account
          .remove()
          .then(() =>
            res
              .status(200)
              .json({ msg: 'Account has been successfully deleted' })
          );
      })
      .catch((err) => res.status(400).json({ msg: 'Delete unsuccessful' }));
  }
);

module.exports = router;
