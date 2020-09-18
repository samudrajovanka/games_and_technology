const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  imageContent: {
    type: Object,
  },
  fieldContent: {
    type: String,
    required: true,
  },
  typeContent: {
    type: String,
    required: true,
  },
  genreContent: {
    type: String,
    required: true,
  },
  tagContent: {
    type: Array,
    required: true,
  },
  isPublish: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      account: {
        type: Schema.Types.ObjectId,
        ref: 'account',
      },
    },
  ],
  comments: [
    {
      account: {
        type: Schema.Types.ObjectId,
        ref: 'account',
      },
      fieldComment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = {
  Content: mongoose.model('content', ContentSchema),
};
