const multer = require('multer');

const imageUploader = () => {
  const storage = multer.diskStorage({
    destination: (req, filename, cb) => {
      cb(null, `api/presents/public/images`);
    },
    filename: (req, filename, cb) => {
      cb(null, Date.now() + filename.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  return multer({ storage: storage, fileFilter: fileFilter }).any('image');
};

module.exports = {
  imageUploader: imageUploader(),
};
