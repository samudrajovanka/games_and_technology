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
  desc: {
    type: String,
    required: true,
  },
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
