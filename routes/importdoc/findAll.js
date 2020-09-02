const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');
const _ = require('lodash');

router.post('/', (req, res) => {
    let { sort, filter, pageSize } = req.body;
    let nextPage = req.body.nextPage || 1;
    console.log(filter.isClosed);
    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else {
        ImportDoc
        .aggregate([
            {
                $addFields: {
                    boeDateX: { $dateToString: { format: "%d-%m-%Y", date: "$boeDate" } },
                    decDateX: { $dateToString: { format: "%d-%m-%Y", date: "$decDate" } },
                }
            },
            {
                $match: {
                    decNr : { $regex: new RegExp(filter.decNr,'i') },
                    boeNr : { $regex: new RegExp(filter.boeNr,'i') },
                    boeDateX : { $regex: new RegExp(filter.boeDate,'i') },
                    decDateX : { $regex: new RegExp(filter.decDate,'i') },
                    isClosed : { $in: isClosed(filter.isClosed)},
                }
            }
        ])
        // .find({
        //     decNr : { $regex: new RegExp(filter.decNr,'i') },
        //     boeNr : { $regex: new RegExp(filter.boeNr,'i') },
        //     // boeDate : { $regex: new RegExp(filter.boeDate,'i') },
        //     // decDate : { $regex: new RegExp(filter.decDate,'i') },
        //     // grossWeight : { $regex: new RegExp(filter.grossWeight,'i') },
        //     // totPrice : { $regex: new RegExp(filter.totPrice,'i') },
        //     isClosed : { $in: isClosed(filter.isAdmin)},
        // })
        .sort({
            [!!sort.name ? sort.name : 'decNr']: sort.isAscending === false ? 1 : -1
        })
        .skip((nextPage - 1) * pageSize)
        // // .limit(pageSize)
        .exec(function (err, importDocs) {
            if (err) {
                console.log('err:', err);
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                let pageLast = Math.ceil(importDocs.length / pageSize) || 1;
                let sliced = importDocs.slice(0, pageSize -1);
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

function isClosed(myBool) {
    switch (myBool) {
        case 'false': return [false];
        case 'true': return [true];
        default: return [true, false, undefined];
    }
}