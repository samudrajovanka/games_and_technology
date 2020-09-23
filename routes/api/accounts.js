const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

// Load Model
const { Account, Role } = require('../../models/Account');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load authentication
const { userAuth, serializeUser } = require('../../utils/auth');

// Load permission
const { actionAccount } = require('../../utils/permission');

// Load Upload Image
const uploadImage = require('../../utils/uploadImage');

// @route   GET api/cccounts
// @desc    Get All Accounts member
// @acess   Public
router.get('/all', (req, res) => {
  Account.find()
    .populate('roleId')
    .exec((err, accounts) => {
      if (err)
        return res.status(500).json({
          status: 'error',
          error: err,
        });

      if (accounts) {
        const accountMember = accounts.filter((account) => {
          return !account.roleId.isAdmin;
        });

        if (accountMember.length !== 0) {
          const accountMemberSerialize = accountsMember.map((accountMember) => {
            return serializeUser(accountMember);
          });
          res.status(200).json(accountMemberSerialize);
        } else {
          res.json({
            success: true,
            message: 'No members',
          });
        }
      } else {
        res.json({
          success: true,
          message: 'No members',
        });
      }
    });
});

// @route   POST api/account
// @desc    Create An Account Member
// @acess   Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  Account.find()
    .then((accounts) => {
      const alreadyAccount = accounts.filter((account) => {
        return (
          account.nickname === req.body.nickname.toLowerCase() ||
          account.email === req.body.email.toLowerCase()
        );
      });

      // if nickname and email is already
      if (alreadyAccount.length !== 0) {
        errors.success = false;
        alreadyAccount.map((account) => {
          if (account.nickname === req.body.nickname.toLowerCase())
            errors.nickname = 'Nickname already exists';
          else if (account.email === req.body.email.toLowerCase())
            errors.email = 'Email already exists';
        });

        return res.status(400).json(errors);
      }

      Role.findOne({ role: 'member' }).then((role) => {
        if (!role) {
          return res.status(400).send({
            success: false,
            role: 'Role not exist',
          });
        }

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
              .then((account) => res.json(serializeUser(account)))
              .catch((err) => console.log(err));
          });
        });
      });
    })
    .catch((err) =>
      res.status(500).json({
        status: 'error',
        error: err,
      })
    );
});

// @route   POST api/account
// @desc    Login An Account Member
// @acess   Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const { email, password } = req.body;

  Account.findOne({ email: email.trim().toLowerCase() }).then((user) => {
    // check for user
    if (!user) {
      errors.success = false;
      errors.email = 'Email not found';
      return res.status(400).json(errors);
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
            expiresIn: 7200,
            algorithm: 'HS256',
          },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
            });
          }
        );
      } else {
        errors.password = 'Password incorrect';
        res.status(400).json(errors);
      }
    });
  });
});

// @route    GET api/accounts/profile/:id
// @desc     Get Account Member
// @access   Public
router.get('/profile/:nickname', (req, res) => {
  Account.findOne({ nickname: req.params.nickname.trim().toLowerCase() })
    .populate('roleId')
    .exec((err, account) => {
      if (err)
        return res.status(500).json({
          status: 'error',
          error: err,
        });

      if (account) return res.send(serializeUser(account));

      return res.status(404).json({
        status: 'error',
        message: 'Page not found',
      });
    });
});

// @route    PUT api/accounts/profile/update/:id
// @desc     Update Account current Member
// @access   Private
router.put(
  '/profile/update/:nickname',
  userAuth,
  actionAccount,
  uploadImage.single('static'),
  (req, res) => {
    const { errors, isValid } = validateUpdateInput(req.body, req.user);
    if (!isValid) return res.status(400).json(errors);

    const accountUpdate = {};

    if (req.body.nickname)
      accountUpdate.nickname = req.body.nickname.trim().toLowerCase();
    if (req.body.email)
      accountUpdate.email = req.body.email.trim().toLowerCase();
    if (req.body.newPassword) accountUpdate.password = req.body.newPassword;

    if (req.file) {
      if (req.user.accountImage.filename !== 'default_user.png') {
        try {
          fs.removeSync(req.user.accountImage.path);
        } catch (err) {
          return res.status(502).send({
            status: 'error',
            message: 'Error deleting image!',
            error: err,
          });
        }
      }
      accountUpdate.accountImage = req.file;
    }

    accountUpdate.socialMedia = {};
    if (req.body.instagram)
      accountUpdate.socialMedia.instagram = req.body.instagram;
    if (req.body.twitter) accountUpdate.socialMedia.twitter = req.body.twitter;
    if (req.body.steam) accountUpdate.socialMedia.steam = req.body.steam;

    accountUpdate.updateAt = Date.now();

    Account.find().then((accounts) => {
      const alreadyAccount = accounts.filter((account) => {
        return (
          account.nickname === accountUpdate.nickname ||
          account.email === accountUpdate.email
        );
      });

      if (alreadyAccount.length !== 0) {
        errors.success = false;
        alreadyAccount.map((account) => {
          if (account.nickname === accountUpdate.nickname)
            errors.nickname = 'Nickname already exists';
          else if (account.email === accountUpdate.email)
            errors.email = 'Email already exists';
        });
        return res.status(400).json(errors);
      }

      Account.findOne({ nickname: req.params.nickname.trim().toLowerCase() })
        .then((account) => {
          if (account) {
            if (req.body.newPassword) {
              SALT_WORK_FACTOR = parseInt(process.env.SALT_WORK_FACTOR);
              bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                bcrypt.hash(accountUpdate.password, salt, (err, hash) => {
                  if (err) throw err;

                  accountUpdate.password = hash;
                  Account.findOneAndUpdate(
                    { nickname: req.params.nickname.toLowerCase() },
                    { $set: accountUpdate },
                    { new: true }
                  ).then((account) => {
                    return res.status(200).json(serializeUser(account));
                  });
                });
              });
            } else if (!isEmpty(req.body) || !isEmpty(req.file)) {
              Account.findOneAndUpdate(
                { nickname: req.params.nickname.trim().toLowerCase() },
                { $set: accountUpdate },
                { new: true }
              ).then((account) => {
                return res.status(200).json(serializeUser(account));
              });
            } else {
              return res.status(200).json({
                success: true,
                message: 'There is no update in your profile',
              });
            }
          }

          if (!account)
            return res.status(404).json({
              status: 'error',
              message: 'Page not found',
            });
        })
        .catch((err) =>
          res.status(500).json({
            status: 'error',
            error: err,
          })
        );
    });
  }
);

// @route   DELETE api/account:id
// @desc    DELETE An Account Member
// @acess   Public
router.delete(
  '/profile/delete/:nickname',
  userAuth,
  actionAccount,
  (req, res) => {
    Account.findOne(req.params.nickname.trim().toLowerCase())
      .then((account) => {
        if (!account)
          return res.status(404).json({
            status: 'error',
            message: 'Page not found',
          });

        if (req.user.accountImage.filename !== 'default_user.png') {
          try {
            fs.removeSync(req.user.accountImage.path);
          } catch (err) {
            return res.status(500).send({
              status: 'error',
              message: 'Error deleting image!',
              error: err,
            });
          }
        }

        account
          .remove()
          .then(() =>
            res.status(200).json({
              success: true,
              message: 'Account has been successfully deleted',
            })
          )
          .catch((err) => {
            return res.status(502).json({
              success: false,
              message: 'Delete unsuccessful',
            });
          });
      })
      .catch((err) =>
        res.status(500).json({
          status: 'error',
          error: err,
        })
      );
  }
);

module.exports = router;
