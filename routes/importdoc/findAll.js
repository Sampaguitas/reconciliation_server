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
    } else {
        ImportDoc
        .aggregate([
            {
                $addFields: {
                    boeDateX: { $dateToString: { format, date: "$boeDate" } },
                    decDateX: { $dateToString: { format, date: "$decDate" } },
                    grossWeightX: { $substrBytes: [ "$grossWeight", 0, 10 ]  },
                    totPriceX: { $substrBytes: [ "$totPrice", 0, 10 ]  },
                }
            },
            {
                $match: {
                    decNr : { $regex: new RegExp(escape(filter.decNr),'i') },
                    boeNr : { $regex: new RegExp(escape(filter.boeNr),'i') },
                    boeDateX : { $regex: new RegExp(escape(filter.boeDate),'i') },
                    decDateX : { $regex: new RegExp(escape(filter.decDate),'i') },
                    grossWeightX: { $regex: new RegExp(escape(filter.grossWeight),'i') },
                    totPriceX: { $regex: new RegExp(escape(filter.totPrice),'i') },
                    isClosed : { $in: filterBool(filter.isClosed)},
                }
            }
        ])
        .sort({
            [!!sort.name ? sort.name : 'decNr']: sort.isAscending === false ? 1 : -1
        })
        // .skip((nextPage - 1) * pageSize)
        // // .limit(pageSize)
        .exec(function (err, importDocs) {
            if (err) {
                console.log('err:', err);
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                console.log(importDocs);
                let pageLast = Math.ceil(importDocs.length / pageSize) || 1;
                let sliced = importDocs.slice((nextPage - 1) * pageSize, pageSize);
                let firstItem = !_.isEmpty(sliced) ? ((nextPage - 1) * pageSize) + 1 : 0;
                let lastItem = !_.isEmpty(sliced) ? firstItem + sliced.length - 1 : 0;
                return res.json({
                    importDocs: sliced,
                    currentPage: nextPage,
                    firstItem: firstItem,
                    lastItem: lastItem,
                    pageItems: sliced.length,
                    pageLast: pageLast,
                    totalItems: importDocs.length,
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