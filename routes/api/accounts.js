const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

// Load Account and Role Model
const { Account, Role } = require('../../models/Account');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load authentication
const { userAuth, serializeUser } = require('../../utils/auth');
// Load Upload Image
const uploadImage = require('../../utils/uploadImage');

// @route   GET api/cccounts
// @desc    Get All Accounts member
// @acess   Public
router.get('/all', (req, res) => {
  Account.find()
    .populate('roleId')
    .exec((err, accounts) => {
      if (err) return res.send(err);
      if (accounts) {
        const accountMember = accounts.filter((account) => {
          return !account.roleId.isAdmin;
        });

        if (accountMember.length !== 0) {
          const accountMemberSerialize = accountsMember.map((accountMember) => {
            return serializeUser(accountMember);
          });
          res.json(accountMemberSerialize);
        } else {
          res.json({
            msg: 'No members',
          });
        }
      } else {
        res.json({
          msg: 'No members',
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

  Account.findOne({ nickname: req.body.nickname }).then((user) => {
    if (user)
      return res.status(400).json({
        nickname: 'Nickname already exists',
        success: false,
      });

    Account.findOne({ email: req.body.email }).then((user) => {
      if (user)
        return res.status(400).json({
          email: 'Email already exists',
          success: false,
        });

      Role.findOne({ role: 'member' }).then((role) => {
        if (!role)
          return res.status(404).send({
            role: 'Role not exist',
            success: false,
          });

        const newAccount = new Account({
          roleId: role._id,
          nickname: req.body.nickname,
          email: req.body.email,
          password: req.body.password,
          accountImage: {
            filename: 'default_user.png',
            path: 'static/image/default_user.png',
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
              .catch((err) =>
                res.send({
                  success: false,
                  err: err,
                })
              );
          });
        });
      });
    });
  });
});

// @route   POST api/account
// @desc    Login An Account Member
// @acess   Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  const email = req.body.email;
  const password = req.body.password;

  Account.findOne({ email }).then((user) => {
    // check for user
    if (!user) {
      errors.email = 'Email not found';
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
        res.status(404).json(errors);
      }
    });
  });
});

// @route    GET api/accounts/profile/:id
// @desc     Get Account Member
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

// @route    PUT api/accounts/profile/update/:id
// @desc     Update Account current Member
// @access   Private
router.put(
  '/profile/update/:id',
  userAuth,
  uploadImage.single('static'),
  (req, res) => {
    const { errors, isValid } = validateUpdateInput(req.body, req.user);
    if (!isValid) return res.status(400).json(errors);

    const accountUpdate = {};

    if (req.body.nickname) accountUpdate.nickname = req.body.nickname;
    if (req.body.email) accountUpdate.email = req.body.email;
    if (req.body.newPassword) accountUpdate.password = req.body.newPassword;
    if (req.file) accountUpdate.accountImage = req.file;

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

// @route   DELETE api/account:id
// @desc    DELETE An Account Member
// @acess   Public
router.delete('/profile/delete/:id', userAuth, (req, res) => {
  Account.findById(req.params.id)
    .then((account) => {
      if (!account)
        return res.status(404).json({ account: 'account not found' });

      account
        .remove()
        .then(() =>
          res.status(200).json({ msg: 'Account has been successfully deleted' })
        );
    })
    .catch((err) => res.status(400).json({ msg: 'Delete unsuccessful' }));
});

module.exports = router;
