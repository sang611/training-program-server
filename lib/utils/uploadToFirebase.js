const {Storage} = require('@google-cloud/storage');
const Multer = require('multer');

const storage = new Storage({
  projectId: "my-project-1558284545367",
  keyFilename: "./lib/utils/my-project-1558284545367-firebase-adminsdk-r3luy-75f14d53cf.json"
});

const bucket = storage.bucket("gs://my-project-1558284545367.appspot.com");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024 // no larger than 100mb, you can change as needed.
  }
});

module.exports = uploadImageToStorage = (file) => {
    return new Promise(function (resolve, reject) {
      if (!file) {
        reject('No image file');
      }
      let newFileName = `${file.originalname}_${Date.now()}`;

      let fileUpload = bucket.file(newFileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });

      blobStream.on('error', (error) => {
          console.log(error);
        reject('Something is wrong! Unable to uploads at the moment.');
      });

      blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const url = (`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
        resolve(url);
      });

      blobStream.end(file.buffer);
    });
  }
