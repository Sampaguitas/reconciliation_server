var express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage });
fs = require('fs');
var aws = require('aws-sdk');
var path = require('path');
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

router.post('/', upload.single('file'), function (req, res) {
  const file = req.file;
  const documentId = req.body.documentId;

  ImportDoc.findOneAndUpdate({_id: documentId}, {fileName: file.originalname}, function(errDoc, resDoc) {
    if (errDoc || !resDoc) {
      return res.status(400).json({message: 'An error has occured.'});
    } else {
      var s3 = new aws.S3();
      var params = {
        Bucket: awsBucketName,
        Body: file.buffer,
        Key: path.join('import', documentId),
      }; 
      s3.upload(params, function(err) {
        if (err) {
          return res.status(400).json({message: 'File could not be uploaded.'});
        } else {
          return res.status(200).json({ message: 'File has successfully been uploaded.'});
        }
      });
    }
  });
});

module.exports = router;