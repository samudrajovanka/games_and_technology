const express = require("express");
const router = express.Router();
const slugify = require("slugify");

// Load Models
const { Content } = require("../../models/Content");
const { Account, Role } = require("../../models/Account");

// Load Authentication
const { userAuth, authAdmin, serializeUser } = require("../../utils/auth.js");

// Load Permission
const checkRoles = require("../../utils/permission.js");

// Load upload image
const uploadImage = require("../../utils/uploadImage");

// Load Validation Create Post
const validateCreatePost = require("../../validation/createPost");
const isEmpty = require("../../validation/isEmpty");

// Load Validation Edit Post
const validateEditPost = require("../../validation/editPost");

// @route   GET api/admin/contents/all
// @desc    GET All Post
// @acess   Public
router.get("/all", (req, res) => {
  Content.find()
    .populate("author")
    .exec((err, contents) => {
      if (err) return res.send(err);

      contents.map((content) => {
        content.author = serializeUser(content.author);
      });
      res.json(contents);
    });
});

// @route   POST api/admin/contents/create
// @desc    Create new post
// @acess   Private
router.post(
  "/create",
  userAuth,
  uploadImage.single("imageContent"),
  authAdmin,
  checkRoles(["operator", "modGame", "modTech"]),
  (req, res) => {
    const { errors, isValid } = validateCreatePost(req.body, req.file);
    // CHECK VALIDATION
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Content.findOne({ title: req.body.title }).then((content) => {
      if (content)
        return res.status(400).json({
          content: "Title already exist",
          success: false,
        });

      Account.findById(req.user._id)
        .populate("roleId")
        .then((account) => {
          let typeAccess;
          switch (account.roleId.role) {
            case "operator":
              typeAccess = req.body.typeContent;
              break;
            case "modGame":
              typeAccess = "game";
              break;
            case "modTech":
              typeAccess = "technology";
              break;
          }

          if (typeAccess !== req.body.typeContent) {
            return res.status(403).json({
              typeContent: "You're role is forbidden to post in this section",
            });
          } else if (typeAccess === undefined) {
            return res.status(400).json({
              success: false,
              content: "Something went wrong",
            });
          }

          const newContent = new Content({
            author: req.user._id,
            title: req.body.title,
            imageContent: req.file,
            fieldContent: req.body.fieldContent,
            typeContent: req.body.typeContent,
            genreContent: req.body.genreContent,
            tagContent: req.body.tagContent.split(" "),
            slug: slugify(req.body.title, { lower: true }),
          });

          newContent
            .save()
            .then((content) =>
              res.status(200).json({
                success: true,
                content: "Your content has been delivered to operator",
              })
            )
            .catch((err) =>
              res.status(400).json({
                success: false,
                content: "Something went wrong",
              })
            );
        })
        .catch((err) => res.json(err));
    });
  }
);

router.put(
  "/edit/:slug",
  userAuth,
  authAdmin,
  uploadImage.single("imageContent"),
  (req, res) => {
    Content.findOne({ slug: req.params.slug })
      .then((content) => {
        if (JSON.stringify(content.author) !== JSON.stringify(req.user._id)) {
          return res
            .status(403)
            .json({ msg: "only the writter who can edit this files" });
        }

        if (content) {
          if (!isEmpty(req.body) || !isEmpty(req.file)) {
            const { errors, isValid } = validateEditPost(req.body, req.file);
            if (!isValid) return res.status(400).json(errors);

            Content.find()
              .then((contents) => {
                const isTitle = contents.some((oldContent) => {
                  return (
                    oldContent.title.toLowerCase() ===
                    req.body.title.toLowerCase()
                  );
                });

                if (isTitle) {
                  res.status(400).json({
                    content: "Title already exist",
                    success: false,
                  });
                } else {
                  if (req.body.title) {
                    contentUpdate.title = req.body.title;
                    contentUpdate.slug = slugify(req.body.title, {
                      lower: true,
                    });
                  }
                  if (req.body.fieldContent)
                    contentUpdate.fieldContent = req.body.fieldContent;
                  if (req.body.genreContent)
                    contentUpdate.genreContent = req.body.genreContent;
                  if (req.file) contentUpdate.imageContent = req.file;

                  contentUpdate.updatedAt = Date.now();

                  Content.findOneAndUpdate(
                    { slug: req.params.slug },
                    { $set: contentUpdate },
                    { new: true }
                  ).then((content) => res.json(content));
                }
              })
              .catch((err) => res.json(err));
            const contentUpdate = {};
          } else {
            res.status(502).json({ msg: "There is no change on your post" });
          }
        }
      })
      .catch((err) => res.send(err));
  }
);

router.delete("/delete/:slug", userAuth, authAdmin, (req, res) => {
  Content.findOne({ slug: req.params.slug })
    .populate({
      path: "author",
      populate: { path: "roleId" },
    })

    .then((content) => {
      if (!content) return res.status(404).json({ msg: "Post not found" });

      if (
        content.author._id !== req.user._id &&
        content.author.roleId.role !== "operator"
      ) {
        console.log("oke");
        return res.status(403).json({
          msg:
            "only the Operator or the Admin who wrote this are able to delete the post",
        });
      }

      content.remove({ slug: req.params.slug }).then(() => {
        return res.status(200).json({ msg: "Post succesfully deleted" });
      });
    })
    .catch((err) => res.send(err));
});
module.exports = router;
