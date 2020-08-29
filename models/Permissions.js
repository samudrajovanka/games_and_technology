const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Permissions schema
const PermissionsSchema = new Schema({
    permission: {
        type: String,
        required: true,
        unique: true,
    },
    roles: {
        type: Array,
        required: true
    },
    desc: {
        type: String,
        required: true
    }
})

module.exports = Permissions = mongoose.model("permissions", PermissionsSchema);