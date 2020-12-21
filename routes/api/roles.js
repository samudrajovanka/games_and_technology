const express = require('express');
const router = express.Router();

// Load model
const { Role, Account } = require('../../models/Account');

// Load authentication
const { userAuth, authAdmin } = require('../../utils/auth');

// Load permission
const { checkPermission } = require('../../utils/permission');

// Load validation
const isEmpty = require('../../validation/isEmpty');

// @route   GET api/roles
// @desc    Get All Role
// @acess   Private
router.get('/all', userAuth, authAdmin, (req, res) => {
  Role.find().then((roles) => {
    res.json(roles);
  });
});

// @route   POST api/roles/add
// @desc    Create an Role
// @acess   Private
router.post(
  '/add',
  userAuth,
  authAdmin,
  checkPermission('isCanCreateRole'),
  (req, res) => {
    Role.findOne({ role: req.body.role }).then((role) => {
      if (role)
        return res.status(400).json({
          success: false,
          message: 'Role already exsist',
        });

      const newRole = new Role({
        role: req.body.role.toLowerCase(),
        isAdmin: req.body.isAdmin,
        description: req.body.description,
        isCanCreateAccount: req.body.isCanCreateAccount,
        isCanUpdateAccount: req.body.isCanUpdateAccount,
        isCanDeleteAccount: req.body.isCanDeleteAccount,
        isCanCreateRole: req.body.isCanCreateRole,
        isCanEditRole: req.body.isCanEditRole,
        isCanDeleteRole: req.body.isCanDeleteRole,
        isCanCreatePost: req.body.isCanCreatePost,
        isCanDeletePost: req.body.isCanDeletePost,
        isCanEditPost: req.body.isCanEditPost,
        isCanApprovePostAboutGame: req.body.isCanApprovePostAboutGame,
        isCanApprovePostAboutTech: req.body.isCanApprovePostAboutTech,
      });

      newRole
        .save()
        .then((role) => res.status(200).json(role))
        .catch((err) =>
          res.status(500).json({
            status: 'error',
            error: err,
          })
        );
    });
  }
);

// @route   PUT api/roles/edit/:id
// @desc    Edit an Role
// @acess   Private
router.put(
  '/edit/:id',
  userAuth,
  authAdmin,
  checkPermission('isCanEditRole'),
  (req, res) => {
    const roleUpdate = {};
    if (req.body.role) roleUpdate.role = req.body.role.toLowerCase();
    if (req.body.isAdmin) roleUpdate.isAdmin = req.body.isAdmin;
    if (req.body.description) roleUpdate.description = req.body.description;
    if (req.body.isCanCreateAccount) roleUpdate.isCanCreateAccount = req.body.isCanCreateAccount;
    if (req.body.isCanUpdateAccount) roleUpdate.isCanUpdateAccount = req.body.isCanUpdateAccount;
    if (req.body.isCanDeleteAccount) roleUpdate.isCanDeleteAccount = req.body.isCanDeleteAccount;
    if (req.body.isCanCreateRole) roleUpdate.isCanCreateRole = req.body.isCanCreateRole;
    if (req.body.isCanEditRole) roleUpdate.isCanEditRole = req.body.isCanEditRole;
    if (req.body.isCanDeleteRole) roleUpdate.isCanDeleteRole = req.body.isCanDeleteRole;
    if (req.body.isCanCreatePost) roleUpdate.isCanCreatePost = req.body.isCanCreatePost;
    if (req.body.isCanDeletePost) roleUpdate.isCanDeletePost = req.body.isCanDeletePost;
    if (req.body.isCanEditPost) roleUpdate.isCanEditPost = req.body.isCanEditPost;
    if (req.body.isCanApprovePostAboutGame) roleUpdate.isCanApprovePost = req.body.isCanApprovePost;
    if (req.body.isCanApprovePostAboutTech) roleUpdate.isCanApprovePostAboutTech = req.body.isCanApprovePostAboutTech;

    Role.find().then((roles) => {
      const roleAlready = roles.filter((role) => {
        return role.role === roleUpdate.role;
      });

      if (roleAlready.length !== 0) {
        return res.status(400).json({
          success: false,
          message: 'role already exist',
        });
      }
      Role.findById(req.params.id).then((role) => {
        if (role) {
          if (!isEmpty(req.body)) {
            Role.findByIdAndUpdate(
              req.params.id,
              { $set: roleUpdate },
              { new: true }
            ).then((role) => {
              return res.status(200).json(role);
            });
          } else {
            return res.status(200).json({
              success: true,
              message: 'There is no update in role',
            });
          }
        }

        if (!role)
          return res.status(404).json({
            status: 'error',
            message: 'Page not found',
          });
      });
    });
  }
);

// @route   DELETE api/roles/delete/:id
// @desc    Delete an Role
// @acess   Private
router.delete(
  '/delete/:id',
  userAuth,
  authAdmin,
  checkPermission('isCanDeleteRole'),
  (req, res) => {
    Account.find()
      .populate('roleId')
      .exec((err, accounts) => {
        if (err)
          return res.status(500).json({
            status: 'error',
            error: err,
          });

        const isUsed = accounts.some((account) => {
          return account.roleId.id === req.params.id;
        });

        if (isUsed)
          return res.status(400).json({
            success: false,
            message:
              'The role you want to delete is currently in use. Make sure the role you want to delete is not is use',
          });

        Role.findById(req.params.id)
          .then((role) => {
            role
              .remove()
              .then(() =>
                res.status(200).json({
                  success: true,
                  message: 'Role has been successfully deleted',
                })
              )
              .catch((err) => {
                return res.status(500).json({
                  success: false,
                  message: 'Delete unsuccessful',
                });
              });
          })
          .catch((err) => {
            res.status(500).json({
              status: 'error',
              error: err,
            });
          });
      });
  }
);

module.exports = router;
