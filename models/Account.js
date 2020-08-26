const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountRole = {
  ADMIN: "Admin",
  MEMBER: "Member",
};

// CREATE SCHEMA
const AccountSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  instagram: {
    type: String,
  },
  twitter: {
    type: String,
  },
  steam: {
    type: String,
  },
  role: {
    type: String,
    default: AccountRole.MEMBER,
  },
  accountImage: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Account = mongoose.model("account", AccountSchema);
