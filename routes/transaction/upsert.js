const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');
const ImportItem = require('../../models/ImportItem');
const ExportItem = require('../../models/ExportItem');

router.post('/', (req, res) => {

    const { importId, exportId } = req.body;

    if (!importId ) {
        return res.status(400).json({ message: 'importId is required.' });
    } else if (!exportId) {
        return res.status(400).json({ message: 'exportId is required.' });
    // } else if (!qty) {
    //     return res.status(400).json({ message: 'qty is required.' });
    // } else if (!mtr) {
    //     return res.status(400).json({ message: 'mtr is required.' });
    // } else {
    //     conditions = { importId, exportId };
    //     update = { $inc: { qty, mtr } };
    //     options = { new: true, upsert: true };
    //     Transaction.findOneAndUpdate(conditions, update, options, function(err, doc) {
    //         if (err) {
    //             return res.status(400).json({ message: 'An error has occured.' });
    //         } else if (!doc) {
    //             return res.status(400).json({ message: 'transaction could not be created.' });
    //         } else {
    //             return res.status(200).json({ message: 'Transaction successfully created.' });
    //         }
    //     });
    // }
    } else {
        ExportItem.findById(exportId, function(err, exportitem) {
            if (err) {
                res.status(400).json({message: 'Could not retreive item information.'});
            } else {
                console.log('exportitem:', exportitem);
                res.status(200).json({message: 'toto.'});
            }
        })
    }
});

module.exports = router;