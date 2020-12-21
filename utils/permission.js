const checkPermission = (permission) => (req, res, next) => {
  
} 

const checkRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.roleId.role)) {
    return res.status(403).send({
      status: 'error',
      message: 'You don\'t have access',
    });
  }
  next();
};

const actionAccount = (req, res, next) => {
  if (
    req.user.nickname !== req.params.nickname.trim().toLowerCase() &&
    req.user.roleId.role !== 'operator'
  )
    return res.status(403).send({
      status: 'error',
      message: "You don't have access",
    });

  next();
};

module.exports = {
  checkPermission,
  checkRoles,
  actionAccount,
};
