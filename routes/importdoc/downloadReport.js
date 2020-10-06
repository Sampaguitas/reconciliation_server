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

                worksheet.getCell('I4').value = `${new Intl.NumberFormat().format(round(importdoc.totalPrice || 0))} AED`;
                worksheet.getCell('I5').value = `${new Intl.NumberFormat().format(round(importdoc.totalNetWeight || 0))} Kgs`;
                worksheet.getCell('I6').value = `${new Intl.NumberFormat().format(round(importdoc.totalGrossWeight || 0))} Kgs`;
                worksheet.getCell('I7').value = importdoc.isClosed ? 'Closed' : 'Open';

                //insert collumns
                let countRows = importdoc.items.reduce(function (acc, cur) {
                  return acc + cur.transactions.length + 2; 
                }, 0);
                worksheet.duplicateRow(12, Math.max(countRows - 3, 0), true);
                
                let i = 10;
                importdoc.items.map((importitem) => {
                  i++
                  //top borders
                  ['A'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style),
                      border = { top: {style:'hair'}, left: {style:'hair'}, right: {style:'hair'} }
                    }
                  });
                  ['B', 'D', 'F', 'H', 'J', 'L', 'O', 'R', 'U'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style),
                      border = { top: {style:'hair'}, left: {style:'hair'} }
                    };
                  });
                  ['M', 'P', 'S', 'V'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style),
                      border = { top: {style:'hair'} }
                    };
                  });
                  ['C', 'E', 'G', 'I', 'K', 'N', 'Q', 'T', 'W'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style),
                      border = { top: {style:'hair'}, right: {style:'hair'} }
                    };
                  });
                  //fill data
                  worksheet.getCell(`A${i}`).value = importitem.srNr;
                  worksheet.getCell(`B${i}`).value = importitem.poNr;
                  worksheet.getCell(`C${i}`).value = importitem.artNr;
                  worksheet.getCell(`D${i}`).value = importitem.desc;
                  worksheet.getCell(`D${i}`).alignment = { wrapText: false };
                  worksheet.getCell(`F${i}`).value = importitem.hsCode;
                  worksheet.getCell(`H${i}`).value = importitem.country;
                  worksheet.getCell(`J${i}`).value = round(importitem.unitPrice);
                  worksheet.getCell(`L${i}`).value = round(importitem.pcs);
                  worksheet.getCell(`O${i}`).value = round(importitem.mtr);
                  worksheet.getCell(`R${i}`).value = round(importitem.totalNetWeight);
                  worksheet.getCell(`U${i}`).value = round(importitem.totalGrossWeight);
                  i++;
                  if (!_.isEmpty(importitem.transactions)) {
                    //middle border
                    ['A'].map(e => {
                      let cell = worksheet.getCell(`${e}${i}`);
                      with (cell) {
                        style = Object.create(cell.style)
                        border = { left: {style:'hair'}, right: {style:'hair'} }
                      }
                    });
                    ['B', 'D', 'F', 'H', 'J', 'L', 'O', 'R', 'U'].map(e => {
                      let cell = worksheet.getCell(`${e}${i}`);
                      with (cell) {
                        style = Object.create(cell.style)
                        border = { left: {style:'hair'} }
                      };
                    });
                    ['M', 'P', 'S', 'V'].map(e => {
                      let cell = worksheet.getCell(`${e}${i}`);
                      with (cell) {
                        style = Object.create(cell.style)
                        border = { }
                      };
                    });
                    ['C', 'E', 'G', 'I', 'K', 'N', 'Q', 'T', 'W'].map(e => {
                      let cell = worksheet.getCell(`${e}${i}`);
                      with (cell) {
                        style = Object.create(cell.style)
                        border = { right: {style:'hair'} }
                      };
                    });
                    importitem.transactions.map((transaction) => {
                      worksheet.getCell(`E${i}`).value = `${transaction.exportitem.exportdoc.decNr} ${transaction.exportitem.exportdoc.boeNr}`;
                      worksheet.getCell(`G${i}`).value = transaction.exportitem.exportdoc.boeDate;
                      worksheet.getCell(`I${i}`).value = transaction.exportitem.srNr;
                      worksheet.getCell(`K${i}`).value = round(transaction.exportitem.unitPrice * (transaction.exportitem.exportdoc.exRate || 1));
                      worksheet.getCell(`M${i}`).value = round(transaction.pcs);
                      worksheet.getCell(`P${i}`).value = round(transaction.mtr);
                      worksheet.getCell(`S${i}`).value = round(transaction.pcs * importitem.unitNetWeight);
                      worksheet.getCell(`V${i}`).value = round(transaction.pcs * importitem.unitGrossWeight);
                      i++;
                    });
                  }
                  //bottom border
                  ['A'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style)
                      border = { left: {style:'hair'}, bottom: {style:'hair'}, right: {style:'hair'} }
                    }
                  });
                  ['B', 'D', 'F', 'H', 'J', 'L', 'O', 'R', 'U'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style)
                      border = { left: {style:'hair'}, bottom: {style:'hair'} }
                    };
                  });
                  ['M', 'P', 'S', 'V'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style)
                      border = { bottom: {style:'hair'} }
                    };
                  });
                  ['C', 'E', 'G', 'I', 'K', 'N', 'Q', 'T', 'W'].map(e => {
                    let cell = worksheet.getCell(`${e}${i}`);
                    with (cell) {
                      style = Object.create(cell.style)
                      border = { bottom: {style:'hair'}, right: {style:'hair'} }
                    };
                  });
                  worksheet.getCell(`E${i}`).value = 'Remaining:'
                  worksheet.getCell(`N${i}`).value = round(importitem.pcs - importitem.assignedPcs);
                  worksheet.getCell(`Q${i}`).value = round(importitem.mtr - importitem.assignedMtr);
                  worksheet.getCell(`T${i}`).value = round(importitem.totalNetWeight - (importitem.assignedPcs * importitem.unitNetWeight));
                  worksheet.getCell(`W${i}`).value = round(importitem.totalGrossWeight - (importitem.assignedPcs * importitem.unitGrossWeight));
                });
                wsPageSetup(worksheet, 23, 'landscape');
                workbook.xlsx.write(res);
              });
            }
        });
    }
});

function wsPageSetup(worksheet, lastCol, orientation) {
  worksheet.pageSetup = {
    orientation: orientation,
    paperSize: 9,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: `A1:${alphabet(lastCol) + worksheet.lastRow._number}`,
    margins: {
      left: 0.25, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3    
    }
  }
}

function round(fieldValue) {
  if (!fieldValue) {
    return 0;
  } else {
    return Math.round((Number(fieldValue) + Number.EPSILON) * 100) / 100;
  }
 
}

function alphabet(num){
  var s = '', t;
  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(65 + t) + s;
    num = (num - t)/26 | 0;
  }
  return s || undefined;
}

module.exports = router;