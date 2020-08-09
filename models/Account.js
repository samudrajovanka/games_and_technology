const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const AccountSchema = new Schema({
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Account = mongoose.model('account', AccountSchema);