const express = require('express');
const router = express.Router();
const ExportDoc = require('../../models/ExportDoc');
const _ = require('lodash');

router.post('/', (req, res) => {
    let { sort, filter, pageSize, dateFormat } = req.body;
    let nextPage = req.body.nextPage || 1;
    let format = dateFormat.replace('DD', '%d').replace('MM', '%m').replace('YYYY', '%Y');

    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else {
        ExportDoc
        .aggregate([
            {
                $addFields: {
                    boeDateX: { $dateToString: { format, date: "$boeDate" } },
                    totalNetWeightX: { $toString: "$totalNetWeight" },
                    totalGrossWeightX: { $toString: "$totalGrossWeight" },
                    totalPriceX: { $toString: "$totalPrice" },
                }
            },
            {
                $match: {
                    invNr : { $regex: new RegExp(escape(filter.invNr),'i') },
                    decNr : { $regex: new RegExp(escape(filter.decNr),'i') },
                    boeNr : { $regex: new RegExp(escape(filter.boeNr),'i') },
                    currency : { $regex: new RegExp(escape(filter.currency),'i') },
                    $or: [ { boeDateX : { $regex: new RegExp(escape(filter.boeDate),'i') } }, { boeDate: { $exists: false } }, { boeDate: null }  ],
                    // boeDateX : { $regex: new RegExp(escape(filter.boeDate),'i') },
                    totalNetWeightX: { $regex: new RegExp(escape(filter.totalNetWeight),'i') },
                    totalGrossWeightX: { $regex: new RegExp(escape(filter.totalGrossWeight),'i') },
                    totalPriceX: { $regex: new RegExp(escape(filter.totalPrice),'i') },
                    isClosed : { $in: filterBool(filter.isClosed)},
                }
            },
            {
                $project: {
                    invNr: 1,
                    decNr: 1,
                    boeNr: 1,
                    boeDate: 1,
                    totalNetWeight: 1,
                    totalGrossWeight: 1,
                    totalPrice: 1,
                    currency: 1,
                    status: { 
                        $cond: {
                            if: { 
                                $eq: ["$isClosed", true]
                            },
                            then: "Closed",
                            else: "Open"
                        }
                    }
                }
            }
        ])
        .sort({
            [!!sort.name ? sort.name : 'invNr']: sort.isAscending === false ? -1 : 1
        })
        .exec(function (err, exportDocs) {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                let pageLast = Math.ceil(exportDocs.length / pageSize) || 1;
                let sliced = exportDocs.slice((nextPage - 1) * pageSize, ((nextPage - 1) * pageSize) + pageSize);
                let firstItem = !_.isEmpty(sliced) ? ((nextPage - 1) * pageSize) + 1 : 0;
                let lastItem = !_.isEmpty(sliced) ? firstItem + sliced.length - 1 : 0;
                return res.json({
                    exportDocs: sliced,
                    currentPage: nextPage,
                    firstItem: firstItem,
                    lastItem: lastItem,
                    pageItems: sliced.length,
                    pageLast: pageLast,
                    totalItems: exportDocs.length,
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
    return !_.isUndefined(string) ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}