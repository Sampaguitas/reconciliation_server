var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
fs = require('fs');

let headers = [
    { number: 'A', value: '#' },
    { number: 'B', value: 'Batch Nr' },
    { number: 'C', value: 'Inv Nr' },
    { number: 'D', value: 'PO Nr' },
    { number: 'E', value: 'Art Nr' },
    { number: 'F', value: 'Description' },
    { number: 'G', value: 'Pcs' },
    { number: 'H', value: 'Mtr' },
    { number: 'I', value: 'Total Net Weight (SAP)' },
    { number: 'J', value: 'Total Price (GRN)' },
    { number: 'K', value: 'HS Code' },
    { number: 'L', value: 'HS Desc' },
    { number: 'M', value: 'HS Country' },
    { number: 'N', value: 'HS Value' },
    { number: 'O', value: 'HS Net Weight' },
    { number: 'P', value: 'HS Gross Weight' },
];

router.get('/', function (req, res) {
    workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet', { properties: { defaultColWidth: 13 } });
    headers.map(header => {
        let cell = worksheet.getCell(`${header.number}1`);
        with (cell) {
            value = header.value
            style = Object.create(cell.style), //shallow-clone the style, break references
            fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'cccccc'}
            }
        }
    });
    workbook.xlsx.write(res);
});

module.exports = router;