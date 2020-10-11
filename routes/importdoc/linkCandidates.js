const express = require('express');
const router = express.Router();
const _ = require('lodash');
const ImportDoc = require('../../models/ImportDoc');
const ExportItem = require('../../models/ExportItem')
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {

    let documentId = req.body.documentId;
    let myPromises = [];
    let nRejected = 0;
    let nAdded = 0;

    ImportDoc
    .findById(documentId)
    .populate('items')
    .exec(function(err, importDoc) {
        if(err) {
            res.status(400).json({message: 'An error has occured.'});
        } else if (!importDoc) {
            res.status(400).json({message: 'Could not retreive importDoc information.'});
        } else if (_.isEmpty(importDoc.items)) {
            res.status(400).json({message: 'The importDoc does not contain any items.'});
        } else {
            let poNrs = importDoc.items.reduce(function(acc, cur) {
                if (!acc.includes(cur.poNr)) {
                    acc.push(cur.poNr);
                }
                return acc;
            }, []);
            ExportItem.find({ poNr: { $in: poNrs}})
            .populate('exportdoc')
            .exec(async function(err, exportitems) {
                if (err) {
                    res.status(400).json({message: 'An error has occured.'});
                } else if (!exportitems) {
                    res.status(400).json({message: 'could not find any candidates.'});
                } else {
                    let transactions = importDoc.items.reduce(function(acc, cur) {
                        let candidates = exportitems.filter(element => _.isEqual(element.poNr, cur.poNr) && _.isEqual(element.artNr, cur.artNr));
                        if (!_.isEmpty(candidates)) {
                            let importRemPcs = Math.max(cur.pcs - (cur.assignedPcs || 0), 0);
                            let importRemMtr = Math.max(cur.mtr - (cur.assignedMtr || 0), 0);
                            for (var index in candidates) {
                                let exportRemPcs = Math.max(candidates[index].pcs - (candidates[index].assignedPcs || 0), 0);
                                let exportRemMtr = Math.max(candidates[index].mtr - (candidates[index].assignedMtr || 0), 0);
                                let pcs = Math.min(importRemPcs, exportRemPcs);
                                let mtr = Math.min(importRemMtr, exportRemMtr);
                                // let isMore = ( cur.unitPrice / (candidates[index].exportdoc.exRate || 1) ) > candidates[index].unitPrice 
                                let summary = importDoc.summary.find(element => _.isEqual(element.hsCode, cur.hsCode) && _.isEqual(element.country, cur.country));
                                if (!_.isUndefined(summary)) {
                                    let isMore = ((summary.totalPrice / summary.pcs) / (candidates[index].exportdoc.exRate || 1) ) > candidates[index].unitPrice;
                                    if ((pcs != 0 || mtr != 0) && !isMore) {
                                        importRemPcs = Math.max(importRemPcs - pcs, 0);
                                        importRemMtr = Math.max(importRemMtr - mtr, 0);
                                        candidates[index].assignedPcs += pcs;
                                        candidates[index].assignedMtr += mtr;
                                        acc.push({
                                            exportId: candidates[index]._id,
                                            importId: cur._id,
                                            pcs: pcs,
                                            mtr: mtr
                                        });
                                    }
                                }
                            }
                        }
                        return acc;
                    }, []);
                    if (_.isEmpty(transactions)) {
                        res.status(400).json({message: 'could not find any candidates.'});
                    } else {
                        transactions.map(transaction => myPromises.push(upsert(transaction)));

                        await Promise.all(myPromises).then(resMyPromises => {
                            resMyPromises.map(r => {
                                if (r.isRejected) {
                                    nRejected++;
                                } else {
                                    nAdded++;
                                }
                            });
                            return res.status(nRejected ? 400 : 200).json({message: `${nAdded} transactions created, ${nRejected} transactions rejected.`});
                        }).catch( () => {
                            return res.status(nRejected ? 400 : 200).json({message: `${nAdded} transactions created, ${nRejected} transactions rejected.`});
                        });
                    }
                }
            });
        }
    })

});

function upsert(transaction) {
    return new Promise(function(resolve) {
        let { importId, exportId, pcs, mtr } = transaction;
        let conditions = { importId, exportId };
        let update = { $inc: { pcs, mtr } };
        let options = { new: true, upsert: true };

        Transaction.findOneAndUpdate(conditions, update, options, function(err, doc) {
            if (!!err || !doc) {
                resolve();
            } else {
                resolve();
            }
        });
    });
}

module.exports = router;