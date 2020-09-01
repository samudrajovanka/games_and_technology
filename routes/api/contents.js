const router = require('express').Router;
const slugify = require('slugify');

// Load Models
const { Content } = require('../../models/Content');
const { Account, Role } = require('../../models/Account');

// Load Authentication
const { userAuth, authAdmin } = require('../../utils/auth.js');

// Load Permission
const checkRoles = require('../../utils/permission.js');
const Account = require('../../models/Account');



// @route   GET api/admin/contents/all
// @desc     GET All Post
// @acess   Public
// router.get('/all', (req,res) => {
//     Content.find()
//     .populate()
//     .
// })

// @route   POST api/admin/contents/create
// @desc    Create new post
// @acess   Private
router.post(
  '/create',
  userAuth,
  authAdmin,
  checkRoles(['operator', 'modGame', 'modTech']),
  (req, res) => {
    Content.findOne({ title: req.body.title }).then((content) => {
      if (content)
        return res.status(400).json({
          content: 'Title already exist',
          success: false,
        });

      Account.findById(req.user._id)
        .populate('roleId')
        .then((account) => {
          let typeAccess;
          switch (account.roleId.role) {
            case 'operator':
              typeAccess = req.body.typeContent;
              break;
            case 'modGame':
              typeAccess = 'game';
              break;
            case 'modTech':
              typeAccess = 'tech';
              break;
          }

          if (typeAccess !== req.body.typeContent) {
            return res.status(403).json({
              typeContent: "You're role is forbidden to post in this section",
            });
          }

          const newContent = new Content({

          });
        })
        .catch((err) => res.json(err));
    });
  }
);
