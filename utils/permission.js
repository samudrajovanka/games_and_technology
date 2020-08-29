const Permissions = require("../models/Permissions");

const permission = permission => (req, res, next) => {
    Permissions.findOne({ permission: permission })
        .then(permission => {
            if (!permission.roles.includes(req.user.roleId.role)) {
                return res.status(400).send({
                    msg: "You no have access"
                })
            }

            next()
        })
}

module.exports = permission