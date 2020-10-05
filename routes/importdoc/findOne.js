const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');
const _ = require('lodash');

router.post('/', (req, res) => {
    let { sort, filter, pageSize } = req.body;
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
                invNr : { $regex: new RegExp(escape(filter.invNr),'i') },
                poNr : { $regex: new RegExp(escape(filter.poNr),'i') },
                artNr: { $regex: new RegExp(escape(filter.artNr),'i') },
                desc : { $regex: new RegExp(escape(filter.desc),'i') },
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
                let regPcs = new RegExp(escape(filter.pcs),'i');
                let regMtr = new RegExp(escape(filter.mtr),'i');
                let regNetWeigth = new RegExp(escape(filter.totalNetWeight), 'i');
                let regGrossWeigth = new RegExp(escape(filter.totalGrossWeight), 'i');
                let regUnitPrice = new RegExp(escape(filter.unitPrice), 'i');
                let regTotalPrice = new RegExp(escape(filter.totalPrice), 'i');
                let regRemPcs = new RegExp(escape(filter.remainingPcs), 'i');
                let regRemMtr = new RegExp(escape(filter.remainingMtr), 'i');
                
                let filtered = importDoc.items.reduce(function(acc, cur) {
                    
                    let testSrNr = regSrNr.test(cur.srNrX);
                    let testPcs = regPcs.test(cur.pcsX);
                    let testMtr = regMtr.test(cur.mtrX);
                    let testNetWeigth = regNetWeigth.test(cur.totalNetWeightX);
                    let testTotWeigth = regGrossWeigth.test(cur.totalGrossWeightX);
                    let testUnitPrice = regUnitPrice.test(cur.unitPriceX);
                    let testTotalPrice = regTotalPrice.test(cur.totalPriceX);
                    let testRemPcs = regRemPcs.test(cur.remainingPcsX);
                    let testRemMtr = regRemMtr.test(cur.remainingMtrX);
                    
                    if (testSrNr && testPcs && testMtr && testNetWeigth && testTotWeigth && testUnitPrice && testTotalPrice && testRemPcs && testRemMtr && filterBool(filter.isClosed).includes(cur.isClosed)) {
                        acc.push({
                            _id: cur._id,
                            srNr: cur.srNr,
                            invNr: cur.invNr,
                            poNr: cur.poNr,
                            artNr: cur.artNr,
                            desc: cur.desc,
                            pcs: cur.pcs,
                            mtr: cur.mtr,
                            totalNetWeight: cur.totalNetWeight,
                            totalGrossWeight: cur.totalGrossWeight,
                            unitPrice: cur.unitPrice,
                            totalPrice: cur.totalPrice,
                            hsCode: cur.hsCode,
                            hsDesc: cur.hsDesc,
                            country: cur.country,
                            remainingPcs: cur.remainingPcs,
                            remainingMtr: cur.remainingMtr,
                            status: cur.isClosed ? 'Closed' : 'Open',
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
                        sfiNr: importDoc.sfiNr,
                        boeDate: importDoc.boeDate,
                        pcs: importDoc.pcs,
                        totalNetWeight: importDoc.totalNetWeight,
                        totalGrossWeight: importDoc.totalGrossWeight,
                        totalPrice: importDoc.totalPrice,
                        isClosed: importDoc.isClosed,
                        fileName: importDoc.fileName || '',
                        summary: importDoc.summary || [],
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
    return !_.isUndefined(string) ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}

function filterBool(element) {
    switch (element) {
        case 'false': return [false];
        case 'true': return [true];
        default: return [true, false, undefined];
    }
}