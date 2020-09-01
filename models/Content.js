const mongoose = require('mongoose');
const schema = mongoose.Schema;

const ContentSchema = new schema({
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
    required: true,
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
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  like: [
    {
      account: {
        type: Schema.Types.ObjectId,
        ref: 'account',
      },
    },
  ],
  comment: [
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
