const express = require('express');
const router = express.Router();
const ExportDoc = require('../../models/ExportDoc');

router.post('/', (req, res) => {

    const {invNr, decNr, boeNr, boeDate, totalGrossWeight, totalPrice} = req.body;

    if (!invNr ) {
        return res.status(400).json({ message: 'Invoice number are required.' });
    } else {
        let conditions =  { invNr };
        let update = { decNr, boeNr, boeDate, totalGrossWeight, totalPrice };
        let options = { new: true, upsert: true };
        
        ExportDoc.findOneAndUpdate(conditions, update, options , function (errDoc, resDoc) {
            if (errDoc || !resDoc) {
                return res.status(400).json({ message: 'ExportDoc could not be created.' });
            } else {
                res.status(200).json({message: 'New ExportDoc whas successfuly created.'});
            }
        });
    }
});

module.exports = router;