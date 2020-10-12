const express = require('express');
const router = express.Router();
const _ = require('lodash');
const ExportDoc = require('../../models/ExportDoc');
const ImportItem = require('../../models/ImportItem');
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {

    let documentId = req.body.documentId;
    let myPromises = [];
    let nRejected = 0;
    let nAdded = 0;

    ExportDoc
    .findById(documentId)
    .populate('items')
    .exec(function(err, exportDoc) {
        if(err) {
            res.status(400).json({message: 'An error has occured.'});
        } else if (!exportDoc) {
            res.status(400).json({message: 'Could not retreive exportDoc information.'});
        } else if (_.isEmpty(exportDoc.items)) {
            res.status(400).json({message: 'The exportDoc does not contain any items.'});
        } else {
            let poNrs = exportDoc.items.reduce(function(acc, cur) {
                if (!acc.includes(cur.poNr)) {
                    acc.push(cur.poNr);
                }
                return acc;
            }, []);
            ImportItem.find({ poNr: { $in: poNrs} }, async function(err, importitems) {
                if (err) {
                    res.status(400).json({message: 'An error has occured.'});
                } else if (!importitems) {
                    res.status(400).json({message: 'could not find any candidates.'});
                } else {
                    let transactions = exportDoc.items.reduce(function(acc, cur) {
                        let candidates = importitems.filter(element => _.isEqual(element.poNr, cur.poNr) && _.isEqual(element.artNr, cur.artNr));
                        if (!_.isEmpty(candidates)) {
                            let exportRemPcs = Math.max(cur.pcs - (cur.assignedPcs || 0), 0);
                            let exportRemMtr = Math.max(cur.mtr - (cur.assignedMtr || 0), 0);
                            for (var index in candidates) {
                                let importRemPcs = Math.max(candidates[index].pcs - (candidates[index].assignedPcs || 0), 0);
                                let importRemMtr = Math.max(candidates[index].mtr - (candidates[index].assignedMtr || 0), 0);
                                let pcs = Math.min(exportRemPcs, importRemPcs);
                                let mtr = Math.min(exportRemMtr, importRemMtr);
                                let isMore = (candidates[index].unitPrice / (exportDoc.exRate || 1) ) > cur.unitPrice
                                if ((pcs != 0 || mtr != 0) && !isMore) {
                                    exportRemPcs = Math.max(exportRemPcs - pcs, 0);
                                    exportRemMtr = Math.max(exportRemMtr - mtr, 0);
                                    candidates[index].assignedPcs += pcs;
                                    candidates[index].assignedMtr += mtr;
                                    acc.push({
                                        importId: candidates[index]._id,
                                        exportId: cur._id,
                                        pcs: pcs,
                                        mtr: mtr
                                    });
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
                resolve({ isRejected: true });
            } else {
                resolve({ isRejected: false });
            }
        });
    });
}

module.exports = router;