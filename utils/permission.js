const checkPermission = (permission) => (req, res, next) => {
  const entries = Object.entries(req.user.roleId['_doc']);

  let valid = false;
  for(const [key, value] of entries) {
    if(key === permission) {
      if(value === true) {
        valid = true;
        break;
      }
      break;
    }
  }

  if(valid) {
    next();
  } else {
    return res.status(403).send({
        status: 'error',
        message: 'You don\'t have access',
    });
  }
}

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
  actionAccount,
};
