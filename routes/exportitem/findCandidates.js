const express = require('express');
const router = express.Router();
const ImportItem = require('../../models/ImportItem');
const _ = require('lodash');

router.post('/', (req, res) => {

    let { exRate, filter, sort } = req.body;

    if (!filter.artNr) {
        res.status(400).json({message: 'Article number is required'});
    } else if (!filter.poNr) {
        res.status(400).json({mesaage: 'PO number is required.'});
    } else {
        ImportItem
        .aggregate([
            {
                $match: {
                    artNr: filter.artNr,
                    poNr: filter.poNr,
                    country : { $regex: new RegExp(escape(filter.country),'i') },
                    hsCode : { $regex: new RegExp(escape(filter.hsCode),'i') },
                }
            },
            {
                $lookup: {
                    from: "importdocs",
                    localField: "documentId",
                    foreignField: "_id",
                    as: "importdocs"
                }
            },
            {
                $addFields: {
                    decNr: { $ifNull: [ { $arrayElemAt: ["$importdocs.decNr", 0] }, ""] },
                    boeNr: { $ifNull: [ { $arrayElemAt: ["$importdocs.boeNr", 0] }, ""] },
                    srNrX: { $toString: "$srNr" },
                    tempPcs: { $subtract: ["$pcs", { $ifNull: ["$assignedPcs", 0] } ] },
                    tempMtr: { $subtract: ["$pcs", { $ifNull: ["$assignedPcs", 0] } ] },
                    pcsX: { $toString: { $subtract: ["$pcs", { $ifNull: ["$assignedPcs", 0] } ] } },
                    mtrX: { $toString: { $subtract: ["$mtr", { $ifNull: ["$assignedMtr", 0] } ] } },
                    unitNetWeightX: { $toString: "$unitNetWeight" },
                    unitGrossWeightX: { $toString: "$unitGrossWeight" },
                    fPriceX: { $toString: { $divide: ["$unitPrice", exRate] } },
                    linked: {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $lte: [
                                            { $subtract: ["$pcs", { $ifNull: ["$assignedPcs", 0] } ] },
                                            0
                                        ]
                                    },
                                    {
                                        $lte: [
                                            { $subtract: ["$mtr", { $ifNull: ["$assignedMtr", 0] } ] },
                                            0
                                        ]
                                    }
                                ]
                            }, then: true, else: false 
                        } 
                    }
                }
            },
            {
                $match: {
                    decNr : { $regex: new RegExp(escape(filter.decNr),'i') },
                    boeNr : { $regex: new RegExp(escape(filter.boeNr),'i') },
                    srNrX : { $regex: new RegExp(escape(filter.srNr),'i') },
                    pcsX : { $regex: new RegExp(escape(filter.pcs),'i') },
                    mtrX : { $regex: new RegExp(escape(filter.mtr),'i') },
                    unitNetWeightX : { $regex: new RegExp(escape(filter.unitNetWeight),'i') },
                    unitGrossWeightX : { $regex: new RegExp(escape(filter.unitGrossWeight),'i') },
                    fPriceX : { $regex: new RegExp(escape(filter.unitPrice),'i') },
                    linked: false,
                }
            },
            {
                $project: {
                    decNr: 1,
                    boeNr: 1,
                    srNr: 1,
                    country: 1,
                    hsCode: 1,
                    pcs: { $subtract: ["$pcs", { $ifNull: ["$assignedPcs", 0] } ] },
                    mtr: { $subtract: ["$mtr", { $ifNull: ["$assignedMtr", 0] } ] },
                    unitNetWeight: 1,
                    unitGrossWeight: 1,
                    unitPrice: { $divide: ["$unitPrice", exRate] },
                }
            }
            
        ])
        .sort({
            [!!sort.name ? sort.name : 'srNr']: sort.isAscending === false ? -1 : 1
        })
        .exec(function(err, candidates) {
            if (err) {
                res.status(400).json({message: 'An error as occured'});
            } else {
                res.status(200).json({candidates});
            }
        });
    }
});

module.exports = router;

function escape(string) {
    return !_.isUndefined(string) ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}