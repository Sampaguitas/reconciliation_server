const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.post('/', (req, res) => {
    let { sort, filter, pageSize } = req.body;
    let nextPage = req.body.nextPage || 1;
    if (!pageSize) {
        res.status(400).json({message: 'pageSize should be greater than 0.'});
    } else {
        ImportDoc
        .find({
            decNr : { $regex: new RegExp(filter.decNr,'i') },
            boeNr : { $regex: new RegExp(filter.boeNr,'i') },
            // boeDate : { $regex: new RegExp(filter.boeDate,'i') },
            // decDate : { $regex: new RegExp(filter.decDate,'i') },
            // grossWeight : { $regex: new RegExp(filter.grossWeight,'i') },
            // totPrice : { $regex: new RegExp(filter.totPrice,'i') },
            status : { $regex: new RegExp(filter.status,'i') },
        })
        .sort({
            [!!sort.name ? sort.name : 'decNr']: sort.isAscending === false ? 1 : -1
        })
        .skip((nextPage - 1) * pageSize)
        // .limit(pageSize)
        .exec(function (err, importDocs) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else {
                let pageLast = Math.ceil(importDocs.length / pageSize) || 1;
                return res.json({
                    importDocs: importDocs.slice(0, pageSize -1),
                    currentPage: nextPage,
                    totalItems: importDocs.length,
                    pageLast: pageLast,
                    first: nextPage < 4 ? 1 : (nextPage === pageLast) ? nextPage - 2 : nextPage - 1,
                    second: nextPage < 4 ? 2 : (nextPage === pageLast) ? nextPage - 1 : nextPage,
                    third: nextPage < 4 ? 3 : (nextPage === pageLast) ? nextPage : nextPage + 1,
                });
            }
        });
    }
});

module.exports = router;