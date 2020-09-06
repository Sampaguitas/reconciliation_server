const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');
const _ = require('lodash');

router.post('/', (req, res) => {
    let { sort, filter, pageSize, dateFormat } = req.body;
    let nextPage = req.body.nextPage || 1;
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');

    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else if (!filter.documentId) {
        res.status(400).json({message: 'documentId is missing.'});
    } else {
        ImportDoc
        .findById(filter.documentId)
        .populate({
            path: 'items',
            sort: {
                [!!sort.name ? sort.name : 'srNr']: sort.isAscending === false ? 1 : -1
            }
        })
        .exec(function (err, importDoc) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                let pageLast = Math.ceil(importDoc.items.length / pageSize) || 1;
                let sliced = importDoc.items.slice((nextPage - 1) * pageSize, pageSize);
                let firstItem = !_.isEmpty(sliced) ? ((nextPage - 1) * pageSize) + 1 : 0;
                let lastItem = !_.isEmpty(sliced) ? firstItem + sliced.length - 1 : 0;
                return res.json({
                    importDoc: {
                        decNr: importDoc.decNr,
                        boeNr: importDoc.boeNr,
                        boeDate: importDoc.boeDate,
                        grossWeight: importDoc.grossWeight,
                        totPrice: importDoc.totPrice,
                        isClosed: importDoc.isClosed,
                        items: sliced
                    },
                    currentPage: nextPage,
                    firstItem: firstItem,
                    lastItem: lastItem,
                    pageItems: sliced.length,
                    pageLast: pageLast,
                    totalItems: importDoc.items.length,
                    first: nextPage < 4 ? 1 : (nextPage === pageLast) ? nextPage - 2 : nextPage - 1,
                    second: nextPage < 4 ? 2 : (nextPage === pageLast) ? nextPage - 1 : nextPage,
                    third: nextPage < 4 ? 3 : (nextPage === pageLast) ? nextPage : nextPage + 1,
                });
            }
        });
    }
});

module.exports = router;

function filterBool(element) {
    switch (element) {
        case 'false': return [false];
        case 'true': return [true];
        default: return [true, false, undefined];
    }
}

function escape(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}