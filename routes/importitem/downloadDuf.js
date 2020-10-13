var express = require('express');
const router = express.Router();
var Excel = require('exceljs');
fs = require('fs');

let headers = [
    { number: 'A', value: '#' },
    { number: 'B', value: 'Inv Nr' },
    { number: 'C', value: 'PO Nr' },
    { number: 'D', value: 'Art Nr' },
    { number: 'E', value: 'Description' },
    { number: 'F', value: 'Pcs' },
    { number: 'G', value: 'Mtr' },
    { number: 'H', value: 'Total Net Weight (SAP)' },
    { number: 'I', value: 'Total Price (GRN)' },
    { number: 'J', value: 'HS Code' },
    { number: 'K', value: 'HS Desc' },
    { number: 'L', value: 'Country' },
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
            // font = {
            //     name: 'Calibri',
            //     color: { argb: 'FFFFFF'},
            //     family: 2,
            //     size: 11,
            //     bold: true
            // },
            // alignment = {
            //     vertical: 'middle',
            //     horizontal: 'left'
            // }
        }
    });
    workbook.xlsx.write(res);
});

module.exports = router;