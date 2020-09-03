const express = require('express');
const router = express.Router();
const slugify = require('slugify');

// Load Models
const { Content } = require('../../models/Content');
const { Account, Role } = require('../../models/Account');

// Load Authentication
const { userAuth, authAdmin, serializeUser } = require('../../utils/auth.js');

// Load Permission
const checkRoles = require('../../utils/permission.js');

// Load upload image
const uploadImage = require('../../utils/uploadImage');

// @route   GET api/admin/contents/all
// @desc    GET All Post
// @acess   Public
router.get('/all', (req, res) => {
  Content.find()
    .populate('author')
    .exec((err, contents) => {
      if (err) return res.send(err);

      contents.map((content) => {
        content.author = serializeUser(content.author);
        res.json(content);
      });
    });
});

// @route   POST api/admin/contents/create
// @desc    Create new post
// @acess   Private
router.post(
  '/create',
  userAuth,
  uploadImage.single('imageContent'),
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
              typeAccess = 'technology';
              break;
          }

          if (typeAccess !== req.body.typeContent) {
            return res.status(403).json({
              typeContent: "You're role is forbidden to post in this section",
            });
          } else if (typeAccess === undefined) {
            return res.status(400).json({
              success: false,
              content: 'Something went wrong',
            });
          }

          const newContent = new Content({
            author: req.user._id,
            title: req.body.title,
            imageContent: req.file,
            fieldContent: req.body.fieldContent,
            typeContent: req.body.typeContent,
            genreContent: req.body.genreContent,
            tagContent: req.body.tagContent.split(' '),
            slug: slugify(req.body.title, { lower: true }),
          });

          newContent
            .save()
            .then((content) =>
              res.status(200).json({
                success: true,
                content: 'Your content has been delivered to operator',
              })
            )
            .catch((err) =>
              res.status(400).json({
                success: false,
                content: 'Something went wrong',
              })
            );
        })
        .catch((err) => res.json(err));
    });
  }
);

module.exports = router;
