const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema Role
const RoleSchema = new Schema({
  role: {
    type: String,
    unique: true,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isCanCreateAccount: {
    type: Boolean,
    default: false,
  },
  isCanUpdateAccount: {
    type: Boolean,
    default: false,
  },
  isCanDeleteAccount: {
    type: Boolean,
    default: false
  },
  isCanCreateRole: {
    type: Boolean,
    default: false
  },
  isCanEditRole: {
    type: Boolean,
    default: false
  },
  isCanDeleteRole: {
    type: Boolean,
    default: false
  },
  isCanCreatePost: {
    type: Boolean,
    default: false
  },
  isCanDeletePost: {
    type: Boolean,
    default: false
  },
  isCanEditPost: {
    type: Boolean,
    default: false
  },
  isCanApprovePostAboutGame: {
    type: Boolean,
    default: false
  },
  isCanApprovePostAboutTech: {
    type: Boolean,
    default: false
  }
});

// Schema Account
const AccountSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  socialMedia: {
    instagram: {
      type: String,
    },
    twitter: {
      type: String,
    },
    steam: {
      type: String,
    },
  },
  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'role',
  },
  accountImage: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updateAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = {
  Account: mongoose.model('account', AccountSchema),
  Role: mongoose.model('role', RoleSchema),
};
