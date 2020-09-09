const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = validateCreatePost = (data, file) => {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.fieldContent = !isEmpty(data.fieldContent) ? data.fieldContent : "";
  file = !isEmpty(file) ? file : "";
  data.genreContent = !isEmpty(data.genreContent) ? data.genreContent : "";

  if (!Validator.isLength(data.title, { min: 5, max: 256 })) {
    errors.title = "Title must be between 5 and 256 characters";
  }
  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }
  if (!Validator.isLength(data.fieldContent, { min: 100 })) {
    errors.fieldContent = "Body field need atleast 100 characters";
  }
  if (Validator.isEmpty(data.fieldContent)) {
    errors.fieldContent = "Body field is required";
  }
  if (isEmpty(file)) {
    errors.imageContent = "Image field is required";
  }
  if (Validator.isEmpty(data.genreContent)) {
    errors.genreContent = "Genre is required";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};
