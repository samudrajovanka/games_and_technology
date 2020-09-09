const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = validateUpdatePots = (data, file) => {
  let errors = {};

  if (data.title) {
    if (Validator.isEmpty(data.title)) {
      errors.title = "Title field is required";
    }
    if (!Validator.isLength(data.title, { min: 5, max: 256 })) {
      errors.title = "Title must be between 5 and 256 characters";
    }
  }

  if (data.fieldContent) {
    if (Validator.isEmpty(data.fieldContent)) {
      errors.fieldContent = "Body field is required";
    }
    if (!Validator.isLength(data.fieldContent, { min: 100 })) {
      errors.fieldContent = "Body Field need atleast 100 characters";
    }
  }

  if (file) {
    if (isEmpty(file)) {
      errors.imageContent = "Image field is required";
    }
  }

  if (data.genreContent) {
    if (Validator.isEmpty(data.genreContent)) {
      errors.genreContent = "Genre field is required";
    }
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
