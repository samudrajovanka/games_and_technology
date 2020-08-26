const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateRegisterInput = (data) => {
  let errors = {};

  data.nickname = !isEmpty(data.nickname) ? data.nickname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmPassword = !isEmpty(data.confirmPassword) ? data.confirmPassword : "";

  if (!Validator.isLength(data.nickname, { min: 5, max: 30 })) {
    errors.nickname = "Nickname must be between 5 and 30 characters";
  }
  if (Validator.isEmpty(data.nickname)) {
    errors.nickname = "Nickname field is required";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  if (!Validator.isLength(data.password, { min: 8 })) {
    errors.password = "Password atleast 8 characters";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  if (Validator.equals(data.password, data.nickname)) {
    errors.password = "Password and Nickname must not be same";
  }
  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm Password field is required";
  }
  if (!Validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Password must match";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
