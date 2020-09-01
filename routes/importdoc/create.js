const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.post('/', (req, res) => {

    const {decNr, boeNr, boeDate, decDate, grossWeight, totPrice} = req.body;

    if (!decNr || !decNr ) {
        return res.status(400).json({ message: 'DEC and BOE numbers are required.' });
    } else {
        let conditions =  {decNr, boeNr};
        let update = { boeDate, decDate, grossWeight, totPrice };
        let options = {new: true, upsert: true};
        
        ImportDoc.findOneAndUpdate(conditions, update, options , function (errDoc, resDoc) {
            if (errDoc || !resDoc) {
                console.log(errDoc); 
                return res.status(400).json({ message: 'ImportDoc could not be created.' });
            } else {
                res.status(200).json({message: 'New ImportDoc whas successfuly created.'});
            }
        });
    }
});

module.exports = router;