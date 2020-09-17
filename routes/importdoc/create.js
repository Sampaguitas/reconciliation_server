const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.post('/', (req, res) => {

    const {decNr, boeNr, boeDate } = req.body;
    let regDec = /^\d{3}-\d{8}-\d{2}$/;
    let regBoe = /^\d{12}$/;
    
    if (!regDec.test(decNr)) {
        return res.status(400).json({ message: 'wrong DEC format number.'})
    } else if (!regBoe.test(boeNr)) {
        return res.status(400).json({ message: 'wrong DEC format number.'})
    } else {
        let conditions =  { decNr, boeNr };
        let update = { poNrs: "", invNrs: "", boeDate, qty: 0, totWeight: 0, totPrice: 0, summary: [] };
        let options = {new: true, upsert: true};
        
        ImportDoc.findOneAndUpdate(conditions, update, options , function (errDoc, resDoc) {
            if (errDoc || !resDoc) {
                return res.status(400).json({ message: 'ImportDoc could not be created.' });
            } else {
                res.status(200).json({message: 'New ImportDoc whas successfuly created.'});
            }
        });
    }
});

module.exports = router;