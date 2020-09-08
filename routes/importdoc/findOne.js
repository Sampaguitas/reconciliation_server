const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');
const _ = require('lodash');

router.post('/', (req, res) => {
    let { sort, filter, pageSize, dateFormat } = req.body;
    let nextPage = req.body.nextPage || 1;
    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else if (!filter.documentId) {
        res.status(400).json({message: 'documentId is missing.'});
    } else {
        ImportDoc
        .findById(filter.documentId)
        .populate({
            path: 'items',
            match: {
                desc : { $regex: new RegExp(escape(filter.desc),'i') },
                invNr : { $regex: new RegExp(escape(filter.invNr),'i') },
                country : { $regex: new RegExp(escape(filter.country),'i') },
                hsCode : { $regex: new RegExp(escape(filter.hsCode),'i') },
            },
            options: {
                sort: {
                    [!!sort.name ? sort.name : 'srNr']: sort.isAscending === false ? -1 : 1
                }
            }
        })
        .exec(function (err, importDoc) {
            if (err) {
                return res.status(500).json({ message: 'Internal server error.'});
            } else if (!importDoc) {
                return res.status(404).json({ message: 'Document not found.'});
            } else {
                let regSrNr = new RegExp(escape(filter.srNr),'i');
                let regWeigth = new RegExp(escape(filter.unitWeight), 'i');
                let regPrice = new RegExp(escape(filter.unitPrice), 'i');
                let filtered = importDoc.items.reduce(function(acc, cur) {
                    if (regSrNr.test(cur.srNrX) && regWeigth.test(cur.unitWeightX) && regPrice.test(cur.unitPriceX)) {
                        acc.push({
                            _id: cur._id,
                            srNr: cur.srNr,
                            desc: cur.desc,
                            invNr: cur.invNr,
                            unitWeight: cur.unitWeight,
                            unitPrice: cur.unitPrice,
                            hsCode: cur.hsCode,
                            country: cur.country,
                            // documentId: cur.documentId
                        });
                    }
                    return acc;
                }, []);
                let pageLast = Math.ceil(filtered.length / pageSize) || 1;
                let sliced = filtered.slice((nextPage - 1) * pageSize, ((nextPage - 1) * pageSize) + pageSize);
                let firstItem = !_.isEmpty(sliced) ? ((nextPage - 1) * pageSize) + 1 : 0;
                let lastItem = !_.isEmpty(sliced) ? firstItem + sliced.length - 1 : 0;
                return res.json({
                    importDoc: {
                        _id: importDoc._id,
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
                    totalItems: filtered.length,
                    first: nextPage < 4 ? 1 : (nextPage === pageLast) ? nextPage - 2 : nextPage - 1,
                    second: nextPage < 4 ? 2 : (nextPage === pageLast) ? nextPage - 1 : nextPage,
                    third: nextPage < 4 ? 3 : (nextPage === pageLast) ? nextPage : nextPage + 1,
                });
            }
        });
    }
});

module.exports = router;

function escape(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}