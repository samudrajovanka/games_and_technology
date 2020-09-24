const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const slugify = require('slugify');

// Load Models
const { Content } = require('../../models/Content');
const { Account } = require('../../models/Account');

// Load Authentication
const { userAuth, authAdmin, serializeUser } = require('../../utils/auth.js');

// Load Permission
const { checkRoles } = require('../../utils/permission.js');

// Load upload image
const uploadImage = require('../../utils/uploadImage');

// Load Validation
const validateCreatePost = require('../../validation/createPost');
const isEmpty = require('../../validation/isEmpty');
const validateEditPost = require('../../validation/editPost');

// @route   GET api/admin/contents/all
// @desc    GET All Post
// @acess   Public
router.get('/all', (req, res) => {
  Content.find()
    .populate('author')
    .exec((err, contents) => {
      if (err)
        return res.status(500).json({
          status: 'error',
          error: err,
        });

      if (contents.length === 0)
        return res.status(200).json({
          success: true,
          message: 'No contents',
        });

      if (!isEmpty(req.query)) {
        if (req.query.author) {
          filterContents = contents.filter((content) => {
            return content.author.nickname === req.query.author;
          });
        }

        if (req.query.isPublish) {
          let isPublish;
          if (req.query.isPublish === 'true') isPublish = true;
          else isPublish = false;

          filterContents = contents.filter((content) => {
            return content.isPublish === isPublish;
          });
        }

        if (req.query.isInAdmin) {
          let isInAdmin;
          if (req.query.isInAdmin === 'true') isInAdmin = true;
          else isInAdmin = false;

          filterContents = contents.filter((content) => {
            return content.isInAdmin === isInAdmin;
          });
        }

        if (filterContents.length === 0)
          return res.status(200).json({
            success: true,
            message: 'No contents',
          });
      } else {
        filterContents = contents;
      }

      filterContents.map((content) => {
        content.author = serializeUser(content.author);
      });
      return res.status(200).json(contents);
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
    const { errors, isValid } = validateCreatePost(req.body, req.file);
    // Check validation
    if (!isValid) return res.status(400).json(errors);

    Content.findOne({ title: req.body.title }).then((content) => {
      if (content)
        return res.status(400).json({
          success: false,
          content: 'Title already exist',
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

          if (typeAccess !== req.body.typeContent || typeAccess === undefined) {
            return res.status(403).json({
              success: false,
              typeContent: "You're role is forbidden to post in this section",
            });
          }

          const newContent = new Content({
            author: req.user._id,
            title: req.body.title.trim(),
            imageContent: req.file,
            fieldContent: req.body.fieldContent.trim(),
            typeContent: req.body.typeContent.toLowerCase(),
            genreContent: req.body.genreContent.toLowerCase(),
            tagContent: req.body.tagContent.split(' '),
            slug: slugify(req.body.title.trim(), { lower: true }),
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
              res.status(500).json({
                success: false,
                content: 'Something went wrong',
              })
            );
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

// @route   POST api/admin/contents/edit/:slug
// @desc    Edit a post
// @acess   Private
router.put(
  '/edit/:slug',
  userAuth,
  authAdmin,
  uploadImage.single('imageContent'),
  (req, res) => {
    Content.findOne({ slug: req.params.slug.trim().toLowerCase() })
      .then((content) => {
        if (!content)
          return res.status(404).json({
            success: false,
            message: 'Page not found',
          });

        if (
          JSON.stringify(content.author) !== JSON.stringify(req.user._id) &&
          req.user.roleId.role !== 'operator'
        ) {
          return res.status(403).json({
            status: 'error',
            message: 'only the writter and operator who can edit this files',
          });
        }

        if (!isEmpty(req.body) || !isEmpty(req.file)) {
          const { errors, isValid } = validateEditPost(req.body, req.file);
          if (!isValid) {
            errors.success = false;
            return res.status(400).json(errors);
          }

          Content.find()
            .then((contents) => {
              if (req.body.title) {
                const isTitle = contents.some((oldContent) => {
                  return (
                    oldContent.title.toLowerCase() ===
                    req.body.title.toLowerCase()
                  );
                });
                if (isTitle) {
                  return res.status(400).json({
                    success: false,
                    content: 'Title already exist',
                  });
                }
              }
              const contentUpdate = {};
              if (req.body.title) {
                contentUpdate.title = req.body.title.trim();
                contentUpdate.slug = slugify(req.body.title.trim(), {
                  lower: true,
                });
              }

              if (req.body.fieldContent)
                contentUpdate.fieldContent = req.body.fieldContent.trim();
              if (req.body.genreContent)
                contentUpdate.genreContent = req.body.genreContent.toLowerCase();
              if (req.file) {
                try {
                  fs.removeSync(content.imageContent.path);
                } catch (err) {
                  return res.status(500).send({
                    status: 'error',
                    message: 'Error deleting image!',
                    error: err,
                  });
                }
                contentUpdate.imageContent = req.file;
              }

              if (req.body.isPublish || req.body.note || req.body.isInAdmin) {
                if (req.body.isPublish) {
                  if (req.user.roleId.role !== 'operator') {
                    return res.status(403).json({
                      success: false,
                      message: "You don't have previlage to publish this post",
                    });
                  }
                  contentUpdate.isPublish = req.body.isPublish;
                }
                if (req.body.note) {
                  if (req.user.roleId.role !== 'operator') {
                    return res.status(403).json({
                      success: false,
                      message:
                        "You don't have previlage to create note this post",
                    });
                  }
                  contentUpdate.note = req.body.note;
                }
                if (req.body.isInAdmin) {
                  if (req.user.roleId.role !== 'operator') {
                    return res.status(403).json({
                      success: false,
                      message: "You don't have previlage to reject this post",
                    });
                  }
                  contentUpdate.isInAdmin = req.body.isInAdmin;
                }
              }

              contentUpdate.updatedAt = Date.now();

              Content.findOneAndUpdate(
                { slug: req.params.slug.trim().toLowerCase() },
                { $set: contentUpdate },
                { new: true }
              ).then((content) => res.status(200).json(content));
            })
            .catch((err) =>
              res.status(500).json({
                status: 'error',
                error: err,
              })
            );
        } else {
          res.status(200).json({
            success: true,
            message: 'There is no change on your post',
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

// @route   POST api/admin/contents/delete/:slug
// @desc    Delete a post
// @acess   Private
router.delete('/delete/:slug', userAuth, authAdmin, (req, res) => {
  Content.findOne({ slug: req.params.slug })
    .populate({
      path: 'author',
      populate: { path: 'roleId' },
    })
    .then((content) => {
      if (!content)
        return res.status(404).json({
          success: false,
          message: 'Page not found',
        });

      if (
        JSON.stringify(content.author._id) !== JSON.stringify(req.user._id) &&
        req.user.roleId.role !== 'operator'
      ) {
        return res.status(403).json({
          success: false,
          message:
            'only the Operator or the Admin who wrote this are able to delete the post',
        });
      }

      try {
        fs.removeSync(content.imageContent.path);
      } catch (err) {
        res.status(502).send({
          status: 'error',
          message: 'Error deleting image!',
          error: err,
        });
      }

      content
        .remove({ slug: req.params.slug.trim().toLowerCase() })
        .then(() => {
          return res.status(200).json({
            success: true,
            message: 'Post succesfully deleted',
          });
        });
    })
    .catch((err) =>
      res.status(500).json({
        status: 'error',
        eropr: err,
      })
    );
});

// @route   POST api/contents/like/:slug
// @desc    Likes a post
// @acess   Private
router.post('/like/:slug', userAuth, (req, res) => {
  Content.findOne({ slug: req.params.slug.trim().toLowerCase() })
    .then((content) => {
      if (!content)
        return res.status(404).json({
          status: 'error',
          message: 'Page not found',
        });

      if (
        content.likes.some(
          (like) =>
            JSON.stringify(like.account) === JSON.stringify(req.user._id)
        )
      )
        return res.status(400).json({
          success: false,
          message: 'You already liked this post',
        });

      content.likes.unshift({ account: req.user._id });

      content.save({ slug: req.params.slug }).then((content) =>
        res.status(200).json({
          success: true,
          message: 'You like this post',
        })
      );
    })
    .catch((err) =>
      res.status(500).json({
        status: 'error',
        error: err,
      })
    );
});

// @route   POST api/contents/unlike/:slug
// @desc    Unlikes a post
// @acess   Private
router.post('/unlike/:slug', userAuth, (req, res) => {
  Content.findOne({ slug: req.params.slug.trim().toLowerCase() })
    .then((content) => {
      if (!content)
        return res.status(404).json({
          status: 'error',
          message: 'Page not found',
        });
      if (
        content.likes.some(
          (like) =>
            JSON.stringify(like.account) === JSON.stringify(req.user._id)
        )
      ) {
        const removeLike = content.likes.findIndex(
          (like) =>
            JSON.stringify(like.account) === JSON.stringify(req.user._id)
        );

        content.likes.splice(removeLike, 1);

        content.save({ slug: req.params.slug.trim().toLowerCase() }).then(() =>
          res.status(200).json({
            success: true,
            message: 'You unlike this post',
          })
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "you haven't like the post",
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        status: 'error',
        error: err,
      })
    );
});

// @route   POST api/admin/contents/comment/:slug
// @desc    Comment a Post
// @acess   Private
router.post('/comment/:slug', userAuth, (req, res) => {
  Content.findOne({ slug: req.params.slug.trim().toString() })
    .then((content) => {
      if (!content)
        return res.status(404).json({
          status: 'error',
          message: 'Page not found',
        });

      const newComment = {
        account: req.user._id,
        fieldComment: req.body.fieldComment,
      };

      content.comments.unshift(newComment);

      content.save({ slug: req.params.slug.trim().toLowerCase() }).then(() =>
        res.status(200).json({
          success: true,
          message: 'You comment this post',
        })
      );
    })
    .catch((err) =>
      res.status(500).json({
        status: 'error',
        error: err,
      })
    );
});

// @route   POST api/admin/contents/comment/:slug
// @desc    delete comment post
// @acess   Private
router.delete('/comment/:slug/delete/:comment_id', userAuth, (req, res) => {
  Content.findOne({ slug: req.params.slug.trim().toLowerCase() })
    .then((content) => {
      if (!content)
        return res.status(404).json({
          status: 'error',
          message: 'Page not found',
        });

      if (
        content.comments.some(
          (comment) =>
            JSON.stringify(comment._id) ===
            JSON.stringify(req.params.comment_id)
        )
      ) {
        const removeComment = content.comments.findIndex(
          (comment) => comment._id === req.params._id
        );

        content.comments.splice(removeComment, 1);

        content.save({ slug: req.params.slug }).then(() =>
          res.status(200).json({
            success: true,
            message: 'You deleted comment',
          })
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "you haven't comment the post",
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        status: 'error',
        error: err,
      })
    );
});
module.exports = router;
