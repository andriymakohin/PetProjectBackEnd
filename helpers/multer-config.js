const util = require('util');
const gc = require('../config/');
const bucket = gc.bucket('kidslikev2_bucket');
const multer = require('multer');

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadImage = (file) => {
  if (!file) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

    const blob = bucket.file(originalname.replace(/ /g, '_'));
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on('finish', () => {
        const publicUrl = util.format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
        );
        resolve(publicUrl);
      })
      .on('error', () => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });
};

module.exports = {
  multerMid,
  uploadImage,
};
