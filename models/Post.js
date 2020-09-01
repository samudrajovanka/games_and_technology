const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// CREATE SCHEMA
const postSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", postSchema);
