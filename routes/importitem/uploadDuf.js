var express = require('express');
const router = express.Router();
var multer = require('multer');
var Excel = require('exceljs');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
fs = require('fs');
var _ = require('lodash');
const ImportItem = require('../../models/ImportItem');

let headers = [
  { number: 'A', key: 'srNr', value: 'SrNo', type: 'number' },
  { number: 'B', key: 'invNr', value: 'Inv Nr', type: 'text' },
  { number: 'C', key: 'poNr', value: 'PO Nr', type: 'text' },
  { number: 'D', key: 'artNr', value: 'Art Nr', type: 'text' },
  { number: 'E', key: 'desc', value: 'Description', type: 'text' },
  { number: 'F', key: 'qty', value: 'Qty', type: 'number' },
  { number: 'G', key: 'totWeight', value: 'Total Weight', type: 'number' },
  { number: 'H', key: 'totPrice', value: 'Total Price', type: 'number' },
  { number: 'I', key: 'insurance', value: 'Insurance', type: 'number' },
  { number: 'J', key: 'exRate', value: 'Ex Rate', type: 'number' },
  { number: 'K', key: 'hsCode', value: 'HS Code', type: 'text' },
  { number: 'L', key: 'hsDesc', value: 'HS Desc', type: 'text' },
  { number: 'M', key: 'country', value: 'Country', type: 'text' },
];

router.post('/', upload.single('file'), function (req, res) {
  
  const documentId = req.body.documentId;
  const file = req.file;

  let colPromises = [];
  let rowPromises = [];

  let tempItem = {};
  
  let rejections = [];
  let nProcessed = 0;
  let nRejected = 0;
  let nAdded = 0;

  let nonPrintable = /[\t\r\n]/mg;
  
        var workbook = new Excel.Workbook();
        workbook.xlsx.load(file.buffer).then(wb => {

          var worksheet = wb.getWorksheet(1);
          let rowCount = worksheet.rowCount;
          
          if (rowCount < 2) {
            return res.status(400).json({
              message: 'The Duf File seems to be empty.',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
            });
          } else if (rowCount > 801) {
            return res.status(400).json({
              message: 'Try to upload less than 800 rows at the time.',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
            });
          } else {
 
            (async function() {
              for (let row = 2; row < rowCount + 1 ; row++) {

                colPromises = [];

                //initialise objects
                for (var member in tempItem) delete tempItem[member];
                
                //assign projectId
                tempItem.documentId = documentId;

                headers.map(header => {
                  let cell = `${header.number}${row}`;
                  let type = header.type;
                  let key = header.key;
                  let value = worksheet.getCell(cell).value
                  
                  if (type === 'String' && value === 0) {
                    value = '0'
                  } else if (nonPrintable.test(value)) {
                    value = value.replace(nonPrintable, '');
                  }
                  
                  colPromises.push(testFormat(row, cell, type, value));
                  
                  tempItem[key] = value;

                });

                await Promise.all(colPromises).then( async () => {
                  rowPromises.push(upsert(documentId, row, tempItem));
                }).catch(errPromises => {
                  if(!_.isEmpty(errPromises)) {
                    rejections.push(errPromises);
                  }
                  nRejected++;
                });

                nProcessed++;
              }

              await Promise.all(rowPromises).then(resRowPromises => {
                resRowPromises.map(r => {
                  if (r.isRejected) {
                    rejections.push({row: r.row, reason: r.reason});
                    nRejected++;
                  } else {
                    nAdded++;
                  }
                });
                return res.status(200).json({
                  rejections: rejections,
                  nProcessed: nProcessed,
                  nRejected: nRejected,
                  nAdded: nAdded,
                });
              }).catch( () => {
                return res.status(400).json({
                  message: 'An error has occured during the upload.',
                  rejections: rejections,
                  nProcessed: nProcessed,
                  nRejected: nRejected,
                  nAdded: nAdded,
                });
              });
              
            })();
          }
        }).catch( () => {
          return res.status(400).json({
              message: 'Could not load the workbook.',
              rejections: rejections,
              nProcessed: nProcessed,
              nRejected: nRejected,
              nAdded: nAdded,
          });
        });
  });

  function upsert(documentId, row, tempItem) {
    return new Promise (function (resolve, reject) {
      if (!tempItem.srNr) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'SrNo should not be empty.'
        });
      } else if (!tempItem.invNr) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Inv Nr should not be empty.'
        });
      } else if (!tempItem.poNr) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'PO Nr should not be empty.'
        });
      } else if (!tempItem.artNr) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Art Nr should not be empty.'
        });
      } else if (!tempItem.desc) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Description should not be empty.'
        });
      } else if (!tempItem.qty) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Qty should not be empty.'
        });
      } else if (!tempItem.totWeight) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Total Weight should not be empty.'
        });
      } else if (!tempItem.totPrice) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Total Price should not be empty.'
        });
      } else if (!tempItem.exRate) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Exchange Rate should not be empty.'
        });
      } else if (!tempItem.hsCode) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'HS Code should not be empty.'
        });
      } else if (!tempItem.hsDesc) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'HS Desc should not be empty.'
        });
      } else if (!tempItem.country) {
        resolve({
          row: row,
          isRejected: true,
          reason: 'Country should not be empty.'
        });
      } else {
        
        let insurance = tempItem.insurance || 0;
        let totPrice = (tempItem.totPrice + insurance) * tempItem.exRate;

        // console.log('unitWeight:', Number(tempItem.totWeight) / Number(qty));

        let newItem = new ImportItem({
          srNr: tempItem.srNr,
          invNr: tempItem.invNr,
          poNr: tempItem.poNr,
          artNr: tempItem.artNr,
          desc: tempItem.desc,
          qty: tempItem.qty,
          unitWeight: tempItem.totWeight / tempItem.qty || 0,
          totWeight: tempItem.totWeight,
          unitPrice: totPrice / tempItem.qty || 0,
          totPrice: totPrice,
          hsCode: tempItem.hsCode,
          hsDesc: tempItem.hsDesc,
          country: tempItem.country,
          documentId: documentId
        });

        newItem.save()
        .then( () => {
          resolve({
            row: row,
            isRejected: false,
            reason: ''
          });
        })
        .catch( (err) => {
          console.log(err);
          resolve({
            row: row,
            isRejected: true,
            reason: 'Fields could not be saved.'
          });
        });
      }
    });
  }

  function testFormat(row, cell, type, value) {
    return new Promise(function (resolve, reject) {
      switch (type){
        case 'number':
          if ((!_.isNull(value) && !_.isUndefined(value)) && !_.isNumber(value)) {
            reject({row: row, reason: `Cell: ${cell} is not a number.`});
          } else {
            resolve();
          }
        break;
        case 'date':
          if((!_.isNull(value) && !_.isUndefined(value)) && !_.isDate(value)) {
            reject({row: row, reason: `Cell: ${cell} is not a date.`});
          } else {
            resolve();
          }
          break;
        case 'string':
          if (_.isObject(value) && value.hasOwnProperty('hyperlink')) {
            reject({row: row, reason: `Cell: ${cell} contains a Hyperlink`});
          } else if (_.isObject(value)) {
            reject({row: row, reason: `Cell: ${cell} contains invalid characters`});
          } else {
            resolve();
          }
          break;
        default: resolve();
      }
    });
  }

module.exports = router;




