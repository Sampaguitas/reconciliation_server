var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
var aws = require('aws-sdk');
var path = require('path');
fs = require('fs');
const accessKeyId = require('../../config/keys').accessKeyId; //../config/keys
const secretAccessKey = require('../../config/keys').secretAccessKey;
const region = require('../../config/keys').region;
const awsBucketName = require('../../config/keys').awsBucketName;
const ExportDoc = require('../../models/ExportDoc');

aws.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
});

router.get('/', function (req, res) {
    const documentId = req.query.documentId;
    if (!documentId) {
        return res.status(400).json({message: "documentId is missing."});
    } else {
        ExportDoc.findById(documentId)
        .populate([
            {
                path: 'exportitems',
                populate: {
                    path: 'transactions',
                    populate: {
                        path: 'importitems',
                        populate: {
                            path: 'importdoc'
                        }
                    }
                }
            }
        ])
        .exec(function(err, exportdoc) {
            if (err) {
                return res.status(400).json({message: 'An error has occured'});
            } else if (!exportdoc) {
                return res.status(400).json({message: 'Could not retrive project information.'});
            } else {
                var s3 = new aws.S3();
                var params = {
                    Bucket: awsBucketName,
                    Key: 'invoice.xlsx',
                };
                var wb = new Excel.Workbook();
                wb.xlsx.read(s3.getObject(params).createReadStream())
                .then(async function(workbook) {
                    workbook.xlsx.write(res);
                });
            }
        });
    }
});

module.exports = router;