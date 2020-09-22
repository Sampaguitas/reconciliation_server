const express = require('express');
const router = express.Router();
const ImportItem = require('../../models/ImportItem');
const _ = require('lodash');

router.post('/', (req, res) => {

    let { artNr, poNr, exRate, filter, sort } = req.body;

    if (!artNr) {
        res.status(400).json({message: 'Article number is required'});
    } else if (!poNr) {
        res.status(400).json({mesaage: 'PO number is required.'});
    } else {
        ImportItem
        .aggregate([
            {
                $match: {
                    artNr: artNr,
                    poNr: poNr,
                }
            },
            {
                $addFields: {
                    fPrice: { $divide: ["$unitPrice", exRate] },
                    fPriceX: { $toString: "$fPrice" },
                }
            },
            // {
            //     $match: {

            //     }
            // },
            {
                $project: {
                    srNr: 1,
                    country: 1,
                    hsCode: 1,
                    pcs: 1,
                    mtr: 1,
                    unitNetWeight: 1,
                    unitGrossWeight: 1,
                    unitPrice: "$fPrice",
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