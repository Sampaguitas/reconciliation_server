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
                path: 'items',
                populate: {
                    path: 'transactions',
                    populate: {
                        path: 'importitem',
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
                    const invSheet = workbook.getWorksheet('Invoice');
                    const delSheet = workbook.getWorksheet('Delivery Advice');
                    const sumSheet = workbook.getWorksheet('HS Code Summary');
                    let exportitems = exportdoc.items.reduce(function(acc, exportitem) {
                            exportitem.transactions.map(transaction => {
                                acc.push({
                                    'A': exportitem.srNr,
                                    'B': `${transaction.importitem.importdoc.dec} ${transaction.importitem.importdoc.boe}`,
                                    'C': transaction.importitem.poNr,
                                    'E': transaction.importitem.srNr,
                                    'G': transaction.importitem.pcs,
                                    'H': transaction.importitem.desc,
                                    'I': transaction.importitem.hsCode,
                                    'J': transaction.importitem.country,
                                    'K': 'NEW',
                                    'L': transaction.importitem.pcs,
                                    'M': 'PCS',
                                    'N': transaction.importitem.unitNetWeight * transaction.pcs,
                                    'O': transaction.importitem.unitGrossWeight * transaction.pcs,
                                    'P': exportitem.unitPrice,
                                    'Q': exportitem.unitPrice * transaction.pcs,
                                });
                            });
                        return acc;
                    }, []);
                    console.log(exportitems.length);
                    invSheet.getCell('H2').value = new Date();
                    invSheet.getCell('M2').value = exportdoc.invNr;
                    invSheet.getCell('P8').value = exportdoc.currency;
                    workbook.xlsx.write(res);
                });
            }
        });
    }
});

module.exports = router;