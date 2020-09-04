const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateUpdatePots = (data, file, currentData) => {
  let errors = {};

  if (data.newTitle) {
    if (Validator.isEmpty(data.newTitle)) {
      errors.title = "Title field is required";
    }
    if (!Validator.isLength(data.newTitle, { min: 5, max: 256 })) {
      errors.title = "Title must be between 5 and 256 characters";
    }
    if (Validator.equals(data.newTitle, currentData.Title)) {
      errors.title = "You entered same title";
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

  if (isEmpty(file)) {
    errors.imageContent = "Image field is required";
  }

  if (data.genreContent) {
    if (Validator.isEmpty(data.genreContent)) {
      errors.genreContent = "Genre field is required";
    }
    return {
      errors,
      isValid: isEmpty(errors),
    };
  }
};
