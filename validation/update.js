const Validator = require('validator');
const bcrypt = require('bcrypt');
const isEmpty = require('./isEmpty');

module.exports = validateUpdateInput = (data, currentData) => {
  const errors = {};

  if (data.nickname) {
    if (!Validator.isLength(data.nickname, { min: 5, max: 30 })) {
      errors.nickname = 'Nickname must be between 5 and 30 characters';
    }
  }

  if (data.email) {
    if (!Validator.isEmail(data.email)) {
      errors.email = 'Email is invalid';
    }
  }

  if (data.name) {
    if (Validator.isEmpty(data.name)) {
      errors.name = 'Name is required!'
    }
  }

  if (data.oldPassword) {
    // check password
    bcrypt.compare(data.oldPassword, currentData.password).then((isMatch) => {
      if (!isMatch) {
        errors.oldPassword = 'Wrong old password';
      }
    });
  }

  if (data.newPassword) {
    if (!Validator.isLength(data.newPassword, { min: 8 })) {
      errors.newPassword = 'New password atleast 8 characters';
    }
    if (Validator.equals(data.oldPassword, data.newPassword)) {
      errors.newPassword = "New password can't be same as old password";
    }
  }
  if (data.newPassword && !data.confirmPassword) {
    if (Validator.isEmpty(data.confirmPassword)) {
      errors.confirmPassword = 'Confirm password field is required';
    }
  }
  if (data.confirmPassword) {
    if (!Validator.equals(data.newPassword, data.confirmPassword)) {
      errors.confirmPassword = 'Password must match';
    }
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
