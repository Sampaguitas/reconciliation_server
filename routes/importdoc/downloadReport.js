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
const ImportDoc = require('../../models/ImportDoc');

aws.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: region
});

// let columns = [   
//   //comon
//   { header: 'poNr', key: 'poNr', width: 10 },
//   { header: 'artNr', key: 'artNr', width: 10 },
//   { header: 'desc', key: 'desc', width: 40 },
//   { header: 'hsCode', key: 'hsCode', width: 10 },
//   { header: 'hsDesc', key: 'hsDesc', width: 20 },
//   { header: 'country', key: 'country', width: 10 },
//   { header: 'unitNetWeight', key: 'unitNetWeight', width: 10 },
//   { header: 'unitGrossWeight', key: 'unitGrossWeight', width: 10 },
//   //import
//   { header: 'importSrNr', key: 'importSrNr', width: 10 },
//   { header: 'importInvNr', key: 'importInvNr', width: 10 },
//   { header: 'importPcs', key: 'importPcs', width: 10 },
//   { header: 'importMtr', key: 'importMtr', width: 10 },
//   { header: 'importUnitPrice', key: 'importUnitPrice', width: 10 },
//   { header: 'importTotalPrice', key: 'importTotalPrice', width: 10 },
//   { header: 'importTotalNetWeight', key: 'importTotalNetWeight', width: 10 },
//   { header: 'importTotalGrossWeight', key: 'importTotalGrossWeight', width: 10 },
//   //export
//   { header: 'exportInvNr', key: 'exportInvNr', width: 10 },
//   { header: 'exportDecNr', key: 'exportDecNr', width: 10 },
//   { header: 'exportBoeNr', key: 'exportBoeNr', width: 10 },
//   { header: 'exportBoeDate', key: 'exportBoeDate', width: 10 },
//   { header: 'exportSrNr', key: 'exportSrNr', width: 10 },
//   { header: 'exportPcs', key: 'exportPcs', width: 10 },
//   { header: 'exportMtr', key: 'exportMtr', width: 10 },
//   { header: 'exportUnitPrice', key: 'exportUnitPrice', width: 10 },
//   { header: 'exportTotalPrice', key: 'exportTotalPrice', width: 10 },
//   { header: 'exportTotalNetWeight', key: 'exportTotalNetWeight', width: 10 },
//   { header: 'exportTotalGrossWeight', key: 'exportTotalGrossWeight', width: 10 },
//   //assigned
//   { header: 'assignedPcs', key: 'assignedPcs', width: 10 },
//   { header: 'assignedMtr', key: 'assignedMtr', width: 10 },
//   { header: 'assignedTotalPrice', key: 'assignedTotalPrice', width: 10 },
//   { header: 'assignedTotalNetWeight', key: 'assignedTotalNetWeight', width: 10 },
//   { header: 'assignedTotalGrossWeight', key: 'assignedTotalGrossWeight', width: 10 },
//   //remaining
//   { header: 'remainingPcs', key: 'remainingPcs', width: 10 },
//   { header: 'remainingMtr', key: 'remainingMtr', width: 10 },
//   { header: 'remainingTotalPrice', key: 'remainingTotalPrice', width: 10 },
//   { header: 'remainingTotalNetWeight', key: 'remainingTotalNetWeight', width: 10 },
//   { header: 'remainingTotalGrossWeight', key: 'remainingTotalGrossWeight', width: 10 },
// ]

router.get('/', function (req, res) {
    const documentId = decodeURI(req.query.documentId);
    if (!documentId) {
        return res.status(400).json({message: "documentId is missing."});
    } else {
      ImportDoc.findById(documentId)
        .populate([
            {
                path: 'items',
                populate: {
                    path: 'transactions',
                    populate: {
                        path: 'exportitem',
                        populate: {
                            path: 'exportdoc'
                        }
                    }
                }
            }
        ])
        .exec(function(err, importdoc) {
            if (err) {
                return res.status(400).json({message: 'An error has occured'});
            } else if (!importdoc) {
                return res.status(400).json({message: 'Could not retrive project information.'});
            } else {
              var s3 = new aws.S3();
              var params = {
                  Bucket: awsBucketName,
                  Key: 'report.xlsx',
              };
              var wb = new Excel.Workbook();
              wb.xlsx.read(s3.getObject(params).createReadStream())
              .then(async function(workbook) {
                const worksheet = workbook.getWorksheet('Sheet1');
                worksheet.getCell('B4').value = importdoc.decNr || '';
                worksheet.getCell('B5').value = importdoc.boeNr || '';
                worksheet.getCell('B6').value = importdoc.sfiNr || '';
                worksheet.getCell('B7').value = importdoc.boeDate || '';

                worksheet.getCell('F4').value = `${new Intl.NumberFormat().format(round(importdoc.pcs || 0))} Pcs`;
                worksheet.getCell('F5').value = `${new Intl.NumberFormat().format(round(importdoc.mtr || 0))} Mtr`;
                worksheet.getCell('F6').value = `${new Intl.NumberFormat().format(round((importdoc.pcs || 0) - (importdoc.assignedPcs || 0)))} Pcs`;
                worksheet.getCell('F7').value = `${new Intl.NumberFormat().format(round((importdoc.mtr || 0) - (importdoc.assignedMtr || 0)))} Mtr`;

                worksheet.getCell('J4').value = `${new Intl.NumberFormat().format(round(importdoc.totalPrice || 0))} AED`;
                worksheet.getCell('J5').value = `${new Intl.NumberFormat().format(round(importdoc.totalNetWeight || 0))} Kgs`;
                worksheet.getCell('J6').value = `${new Intl.NumberFormat().format(round(importdoc.totalGrossWeight || 0))} Kgs`;
                worksheet.getCell('J7').value = importdoc.isClosed ? 'Closed' : 'Open';
                // worksheet.columns = columns;
                let countRows = importdoc.items.reduce(function (acc, cur) {
                  return acc + cur.transactions.length + 3; 
                }, 0);
                worksheet.duplicateRow(12, Math.max(countRows - 4, 0), true);
                
                let i = 10;
                importdoc.items.map((importitem) => {
                  i++
                  worksheet.getCell(`A${i}`).value = importitem.srNr;
                  worksheet.getCell(`B${i}`).value = importitem.poNr;
                  worksheet.getCell(`C${i}`).value = importitem.artNr;
                  worksheet.getCell(`D${i}`).value = importitem.desc;
                  worksheet.getCell(`D${i}`).alignment = { wrapText: false };
                  worksheet.getCell(`F${i}`).value = importitem.hsCode;
                  worksheet.getCell(`H${i}`).value = importitem.country;
                  worksheet.getCell(`J${i}`).value = round(importitem.pcs);
                  worksheet.getCell(`M${i}`).value = round(importitem.mtr);
                  worksheet.getCell(`P${i}`).value = round(importitem.totalNetWeight);
                  worksheet.getCell(`S${i}`).value = round(importitem.totalGrossWeight);
                  worksheet.getCell(`V${i}`).value = round(importitem.unitPrice);
                  worksheet.getCell(`X${i}`).value = round(importitem.totalPrice);
                  i++;
                  if (!_.isEmpty(importitem.transactions)) {
                    importitem.transactions.map((transaction) => {
                      console.log('exportdoc:', transaction.exportitem.exportdoc.decNr);
                      worksheet.getCell(`E${i}`).value = `${transaction.exportitem.exportdoc.decNr} ${transaction.exportitem.exportdoc.boeNr}`;
                      worksheet.getCell(`G${i}`).value = transaction.exportitem.exportdoc.boeDate;
                      worksheet.getCell(`I${i}`).value = transaction.exportitem.srNr;
                      worksheet.getCell(`K${i}`).value = round(transaction.pcs);
                      worksheet.getCell(`N${i}`).value = round(transaction.mtr);
                      worksheet.getCell(`Q${i}`).value = round(transaction.pcs * importitem.unitNetWeight);
                      worksheet.getCell(`T${i}`).value = round(transaction.pcs * importitem.unitGrossWeight);
                      i++;
                    });
                  }
                  worksheet.getCell(`I${i}`).value = 'Remaining:'
                  worksheet.getCell(`I${i}`).font = { name: 'Arial', family: 4, size: 10, underline: 'false', bold: true };
                  worksheet.getCell(`L${i}`).value = round(importitem.pcs - importitem.assignedPcs);
                  worksheet.getCell(`L${i}`).font = { name: 'Arial', family: 4, size: 10, underline: 'false', bold: true };
                  worksheet.getCell(`O${i}`).value = round(importitem.mtr - importitem.assignedMtr);
                  worksheet.getCell(`O${i}`).font = { name: 'Arial', family: 4, size: 10, underline: 'false', bold: true };
                  worksheet.getCell(`R${i}`).value = round(importitem.totalNetWeight - (importitem.assignedPcs * importitem.unitNetWeight));
                  worksheet.getCell(`R${i}`).font = { name: 'Arial', family: 4, size: 10, underline: 'false', bold: true };
                  worksheet.getCell(`U${i}`).value = round(importitem.totalGrossWeight - (importitem.assignedPcs * importitem.unitGrossWeight));
                  worksheet.getCell(`U${i}`).font = { name: 'Arial', family: 4, size: 10, underline: 'false', bold: true };
                  i++
                });

                // let rows = importdoc.items.reduce(function(acc, cur) {
                //   if (_.isEmpty(cur.transactions)) {
                //     acc.push({
                //       //comon
                //       poNr: cur.poNr,
                //       artNr: cur.artNr,
                //       desc: cur.desc,
                //       hsCode: cur.hsCode,
                //       hsDesc: cur.hsDesc,
                //       country: cur.country,
                //       unitNetWeight: cur.unitNetWeight,
                //       unitGrossWeight: cur.unitGrossWeight,
                //       //import
                //       importSrNr: cur.srNr,
                //       importInvNr: cur.invNr,
                //       importPcs: cur.pcs,
                //       importMtr: cur.mtr,
                //       importUnitPrice: cur.unitPrice,
                //       importTotalPrice: cur.totalPrice,
                //       importTotalNetWeight: cur.totalNetWeight,
                //       importTotalGrossWeight: cur.totalGrossWeight,
                //       //export
                //       exportInvNr: '',
                //       exportDecNr: '',
                //       exportBoeNr: '',
                //       exportBoeDate: '',
                //       exportSrNr: '',
                //       exportPcs: '',
                //       exportMtr: '',
                //       exportUnitPrice: '',
                //       exportTotalPrice: '',
                //       exportTotalNetWeight: '',
                //       exportTotalGrossWeight: '',
                //       //assigned
                //       assignedPcs: '',
                //       assignedMtr: '',
                //       assignedTotalPrice: '',
                //       assignedTotalNetWeight: '',
                //       assignedTotalGrossWeight: '',
                //       //remaining
                //       remainingPcs: '',
                //       remainingMtr: '',
                //       remainingTotalPrice: '',
                //       remainingTotalNetWeight: '',
                //       remainingTotalGrossWeight: ''
                //     });
                //   } else {
                //     cur.transactions.map(transaction => {
                //       let exportUnitPrice = transaction.exportitem.unitPrice * (transaction.exportitem.exportdoc.exRate || 1);
                //       let exportTotalPrice = transaction.exportitem.totalPrice * (transaction.exportitem.exportdoc.exRate || 1);
                //       let assignedTotalPrice = exportUnitPrice * transaction.pcs;
                //       let assignedTotalNetWeight = cur.unitNetWeight * transaction.pcs;
                //       let assignedTotalGrossWeight = cur.unitGrossWeight * transaction.pcs;
                //       acc.push({
                //         //comon
                //         poNr: cur.poNr,
                //         artNr: cur.artNr,
                //         desc: cur.desc,
                //         hsCode: cur.hsCode,
                //         hsDesc: cur.hsDesc,
                //         country: cur.country,
                //         unitNetWeight: round(cur.unitNetWeight),
                //         unitGrossWeight: round(cur.unitGrossWeight),
                //         //import
                //         importSrNr: cur.srNr,
                //         importInvNr: cur.invNr,
                //         importPcs: cur.pcs,
                //         importMtr: cur.mtr,
                //         importUnitPrice: round(cur.unitPrice),
                //         importTotalPrice: round(cur.totalPrice),
                //         importTotalNetWeight: round(cur.totalNetWeight),
                //         importTotalGrossWeight: round(cur.totalGrossWeight),
                //         //export
                //         exportInvNr: transaction.exportitem.exportdoc.invNr,
                //         exportDecNr: transaction.exportitem.exportdoc.decNr,
                //         exportBoeNr: transaction.exportitem.exportdoc.boeNr,
                //         exportBoeDate: transaction.exportitem.exportdoc.boeDate || '',
                //         exportSrNr: transaction.exportitem.srNr,
                //         exportPcs: round(transaction.exportitem.pcs),
                //         exportMtr: round(transaction.exportitem.mtr),
                //         exportUnitPrice: round(exportUnitPrice),
                //         exportTotalPrice: round(exportTotalPrice),
                //         exportTotalNetWeight: round(transaction.exportitem.totalNetWeight),
                //         exportTotalGrossWeight: round(transaction.exportitem.totalGrossWeight),
                //         //assigned
                //         assignedPcs: round(transaction.pcs),
                //         assignedMtr: round(transaction.mtr),
                //         assignedTotalPrice: round(assignedTotalPrice),
                //         assignedTotalNetWeight: round(assignedTotalNetWeight),
                //         assignedTotalGrossWeight: round(assignedTotalGrossWeight),
                //         //remaining
                //         remainingPcs: round(cur.pcs - transaction.pcs),
                //         remainingMtr: round(cur.mtr || 0 - transaction.mtr || 0),
                //         remainingTotalPrice: round(cur.totalPrice - assignedTotalPrice),
                //         remainingTotalNetWeight: round(cur.totalNetWeight - assignedTotalNetWeight),
                //         remainingTotalGrossWeight: round(cur.totalGrossWeight - assignedTotalGrossWeight),
                //       });
                //     });
                //   }
                //   return acc;
                // }, []);
                // rows.map((row, indexRow) => {
                //   columns.map((column, indexCol) => {
                //     worksheet.getRow(Number(indexRow) + 2).getCell(Number(indexCol) + 1).value = row[`${column.key}`]
                //   });
                // });
                  workbook.xlsx.write(res);
              });
            }
        });
    }
});

function round(fieldValue) {
  if (!fieldValue) {
    return 0;
  } else {
    return Math.round((Number(fieldValue) + Number.EPSILON) * 100) / 100;
  }
 
}

module.exports = router;