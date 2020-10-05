var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
var aws = require('aws-sdk');
const _ = require('lodash');
const fs = require('fs');
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
                    const today = new Date();
                    const invAlignment = ['B1', 'M1', 'A4', 'C4', 'I4', 'M4', 'A5', 'C5', 'A6', 'C6', 'A7', 'C7', 'C8', 'C9', 'A24', 'A29', 'A31', 'A40'];
                    const delAlignment = ['L6', 'A8', 'A9', 'A11', 'A24', 'F24', 'L40', 'A42', 'F42', 'F44', 'B46', 'F46', 'L49', 'A50', 'L50', 'L58', 'L59'];
                    const sumAlignment = ['A1', 'A2', 'A3'];
                    invAlignment.map(address => invSheet.getCell(address).alignment = { wrapText: false });
                    delAlignment.map(address => delSheet.getCell(address).alignment = { wrapText: false });
                    sumAlignment.map(address => sumSheet.getCell(address).alignment = { wrapText: false });
                    let exportitems = exportdoc.items.reduce(function(acc, exportitem) {
                            exportitem.transactions.map(transaction => {
                                let number = `${transaction.importitem.importdoc.decNr} ${transaction.importitem.importdoc.boeNr}`
                                acc.lines.push({
                                    'A': exportitem.srNr,
                                    'B': number,
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
                                if (!acc.numbers.includes(number)) {
                                    acc.numbers.push(number);
                                }
                                if (!acc.countries.includes(transaction.importitem.country)) {
                                    acc.countries.push(transaction.importitem.country);
                                }
                            });
                        return acc;
                    }, {
                        lines: [],
                        numbers: [],
                        countries: [],
                    });
                    //Invoice
                    invSheet.getCell('H2').value = today;
                    invSheet.getCell('M2').value = exportdoc.invNr;
                    invSheet.getCell('P8').value = exportdoc.currency;
                    invSheet.duplicateRow(18, exportitems.lines.length -1, true);
                    exportitems.lines.map(function (line, lineIndex) {
                        for (let key in line) {
                            invSheet.getCell(`${key}${18 + lineIndex}`).value = line[key];
                        }
                    });
                    
                    //Delivery Advice
                    delSheet.getCell('C6').value = today;
                    delSheet.getCell('A17').value = exportdoc.invNr;
                    let numbers = reshape(exportitems.numbers, Math.ceil(exportitems.numbers.length / 14));
                    numbers.map((number, index) => {
                        if ( index % 2 == 0) {
                            delSheet.getCell(`A${35 + Math.max(index / 2, 0)}`).value = number.join(' / ');
                        } else {
                            delSheet.getCell(`G${35 + Math.max(index / 2, 0) - 1}`).value = number.join(' / ');
                        }
                    });
                    delSheet.getCell('L38').value = exportitems.countries.join(' / ');
                    delSheet.getCell('O38').value = `${exportdoc.currency} ${numberToString(exportdoc.totalPrice)}`;
                    //HS Code Summary
                    sumSheet.getCell('H8').value = exportdoc.currency;
                    sumSheet.duplicateRow(9, exportdoc.summary.length -1, true);
                    exportdoc.summary.map(function (line, lineIndex) {
                        sumSheet.getCell(`A${9 + lineIndex}`).value = line.hsCode;
                        sumSheet.getCell(`B${9 + lineIndex}`).value = line.hsDesc;
                        sumSheet.getCell(`C${9 + lineIndex}`).value = line.country;
                        sumSheet.getCell(`D${9 + lineIndex}`).value = line.pcs;
                        sumSheet.getCell(`E${9 + lineIndex}`).value = line.mtr;
                        sumSheet.getCell(`F${9 + lineIndex}`).value = line.totalNetWeight;
                        sumSheet.getCell(`G${9 + lineIndex}`).value = line.totalGrossWeight;
                        sumSheet.getCell(`H${9 + lineIndex}`).value = line.totalPrice;
                    });
                    workbook.xlsx.write(res);
                });
            }
        });
    }
});

function numberToString (fieldValue) {
    if (fieldValue) {
        return String(new Intl.NumberFormat().format(Math.round((fieldValue + Number.EPSILON) * 100) / 100));
    } else {
        return '';
    }
}

function reshape(array, n){
    return _.compact(array.map(function(el, i){
        if (i % n === 0) {
            return array.slice(i, i + n);
        }
    }))
}

module.exports = router;