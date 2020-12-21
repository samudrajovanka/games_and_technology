const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');

// Load Keys
const keys = require('../../config/keys');

// Load Authentication
const {
  userAuth,
  authAdmin,
  serializeUser,
  loginAdmin,
} = require('../../utils/auth');

// Load checkRole
const { checkPermission, checkRoles, actionAccount } = require('../../utils/permission');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateUpdateInput = require('../../validation/update');

// Load model
const { Account, Role } = require('../../models/Account');

// Load Upload Image
const uploadImage = require('../../utils/uploadImage');
const isEmpty = require('../../validation/isEmpty');

// @route   POST api/admin/login
// @desc    Login An Account Admin
// @acess   Public
router.post('/login', loginAdmin, (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // check validation if field is empty
  if (!isValid) return res.status(400).json(errors);

  const { email, password } = req.body;

  Account.findOne({ email: email.trim().toLowerCase() }).then((account) => {
    // check for account
    if (!account) {
      errors.success = false;
      errors.email = 'Email not found';
      return res.status(400).json(errors);
    }

    // check password
    bcrypt.compare(password, account.password).then((isMatch) => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: account._id,
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
            if (err)
              return res.status(500).json({
                success: false,
                err: err,
              });

            res.json({
              success: true,
              token: 'Bearer ' + token,
            });
          }
        );
      } else {
        errors.success = false;
        errors.password = 'Password incorrect';
        res.status(400).json(errors);
      }
    });
  });
});

// @route   POST api/account
// @desc    Create An Account
// @acess   Private
router.post('/register', userAuth, checkPermission(req.user.roleId.isCanCreateAccount), (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // check validation
  if (!isValid) {
    errors.success = false;
    return res.status(400).json(errors);
  }

  Account.find()
    .then((accounts) => {
      const alreadyAccount = accounts.filter((account) => {
        return (
          account.nickname === req.body.nickname.trim().toLowerCase() ||
          account.email === req.body.email.trim().toLowerCase()
        );
      });

      // if nickname and email is already
      if (alreadyAccount.length !== 0) {
        errors.success = false;
        alreadyAccount.map((account) => {
          if (account.nickname === req.body.nickname.trim().toLowerCase())
            errors.nickname = 'Nickname already exists';
          else if (account.email === req.body.email.trim().toLowerCase())
            errors.email = 'Email already exists';
        });

        return res.status(400).json(errors);
      }

      Role.findOne({ role: req.body.role }).then((role) => {
        if (!role) {
          return res.status(400).send({
            success: false,
            role: 'Role not exist',
          });
        }

        const newAccount = new Account({
          roleId: role._id,
          nickname: req.body.nickname.trim().toLowerCase(),
          name: req.body.name,
          email: req.body.email.trim().toLowerCase(),
          password: req.body.password,
          accountImage: {
            filename: 'default_user.png',
            path: 'static/image/default_user.png',
          },
          socialMedia: {
            instagram: req.body.instagram.trim().toLowerCase(),
            twitter: req.body.twitter.trim().toLowerCase(),
            steam: req.body.steam.trim().toLowerCase(),
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

// @route   GET api/admin/all
// @desc    Get All Account Admin
// @acess   Public
router.get('/profile/all', (req, res) => {
  Account.find()
    .populate('roleId')
    .exec((err, accounts) => {
      if (err)
        return res.status(500).json({
          status: 'error',
          error: err,
        });

      if (accounts) {
        const accountsAdmin = accounts.filter(
          (account) => account.roleId.isAdmin
        );

        if (accountsAdmin.length !== 0) {
          const accountAdminSerialize = accountsAdmin.map((accountAdmin) =>
            serializeUser(accountAdmin)
          );
          return res.status(200).json(accountAdminSerialize);
        } else {
          return res.status(200).json({
            success: true,
            message: 'No admin',
          });
        }
      } else {
        return res.stauts(200).json({
          success: true,
          message: 'No admin',
        });
      }
    });
});

// @route    GET api/admin/profile/:id
// @desc     Get Account Admin
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

// @route    PUT api/admin/profile/update/:nickname
// @desc     Update Account current Admin
// @access   Private
router.put(
  '/profile/update/:nickname',
  userAuth,
  authAdmin,
  actionAccount,
  uploadImage.single('accountImage'),
  (req, res) => {
    const { errors, isValid } = validateUpdateInput(req.body, req.user);
    if (!isValid) return res.status(400).json(errors);
    
    let isOperator = false, isCurrentAccount = false;
    if (req.user.roleId.role === 'operator') isOperator = true;
    if (req.user.nickname === req.params.nickname) isCurrentAccount = true;
  
    const accountUpdate = {};
    
    if(req.body.role || req.body.name) {
      if(!isOperator) {
        return res.status(403).json({
          success: false,
          message: 'Only Operator who able to make a change name or role'
        })
      }

      if(req.body.role) {
        Role.findOne({ role: req.body.role }).then((role) => {
          accountUpdate.roleId = role._id;
        });
      }
      
      if (req.body.name) {
        if (req.user.roleId.role !== 'operator') {
          return res.status(403).json({
            success: false,
            message: 'Only Operator who able to make a change name'
          })
        }
        accountUpdate.name = req.body.name;
      }
    }
    
    if(isCurrentAccount) {
      if (req.body.nickname) 
        accountUpdate.nickname = req.body.nickname.trim().toLowerCase()
      if (req.body.email)
        accountUpdate.email = req.body.email.trim().toLowerCase()
      if (req.body.password)
        accountUpdate.password = req.body.password
      
      if (req.body.instagram || req.body.twitter || req.body.steam) {
        accountUpdate.socialMedia = {}
  
        if (req.body.instagram)
          accountUpdate.socialMedia.instagram = req.body.instagram.trim().toLowerCase()
        if(req.body.twitter)
          accountUpdate.socialMedia.twitter = req.body.twitter.trim().toLowerCase()
        if(req.body.steam)
          accountUpdate.socialMedia.steam = req.body.steam.trim().toLowerCase()
      }
      
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
    }

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
    });
      

      Account.findOne({ nickname: req.params.nickname.toLowerCase() })
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
                { nickname: req.params.nickname.toLowerCase() },
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
          } else {
            return res.status(404).json({
              status: 'error',
              message: 'Page not found',
            });
          }
        })
        .catch((err) =>
          res.status(500).json({
            status: 'error',
            error: err,
          })
        );
  }
);

// @route   DELETE api/admin/profile/delete/:nickname
// @desc    DELETE An Account admin
// @acess   Private
router.delete(
  '/profile/delete/:nickname',
  userAuth,
  authAdmin,
  checkRoles(['operator']),
  (req, res) => {
    Account.findOne({ nickname: req.params.nickname.trim().toLowerCase() })
      .then((account) => {
        if (!account)
          return res.status(404).json({
            status: 'error',
            message: 'Page not found',
          });

        if (account.accountImage.filename !== 'default_user.png') {
          try {
            fs.removeSync(account.accountImage.path);
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
            return res.status(500).json({
              success: false,
              message: 'Delete unsuccessful',
            });
          });
      })
      .catch((err) =>
        res.status(502).json({
          status: 'error',
          error: err,
        })
      );
  }
);

module.exports = router;
