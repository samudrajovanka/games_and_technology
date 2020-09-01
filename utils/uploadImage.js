const multer = require('multer');

// LOCATION SAVING PHOTO FOR ACCOUNT
const accountStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './static/image');
  },
  filename: (req, file, callback) => {
    const extension = '.' + file.originalname.split('.')[1];
    callback(null, Date.now() + req.user._id + extension);
  },
});

// FILTER FILE TYPE
const fileFilter = (req, file, callback) => {
  // ACCEPT A PHOTO
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    callback(null, true);
  } else {
    // REJECT A PHOTO
    callback(null, false);
  }
};
const upload = multer({
  storage: accountStorage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
