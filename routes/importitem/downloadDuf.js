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
    { number: 'F', value: 'Qty' },
    { number: 'G', value: 'Total Weight' },
    { number: 'H', value: 'Total Price' },
    { number: 'I', value: 'Insurance' },
    { number: 'J', value: 'Ex Rate' },
    { number: 'K', value: 'HS Code' },
    { number: 'L', value: 'HS Desc' },
    { number: 'M', value: 'Country' },
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