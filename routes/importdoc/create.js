const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.post('/', (req, res) => {

    const {decNr, boeNr, sfiNr, boeDate } = req.body;
    let regDec = /^\d{3}-\d{8}-\d{2}$/;
    let regBoe = /^\d{12}$/;
    
    if (!decNr || !boeNr || !sfiNr || !boeDate) {
        return res.status(400).json({ message: 'DEC, BOE, SFI and Date are required.'});
    } else if (!regDec.test(decNr)) {
        return res.status(400).json({ message: 'wrong DEC format number.'});
    } else if (!regBoe.test(boeNr)) {
        return res.status(400).json({ message: 'wrong DEC format number.'});
    } else {
        let conditions =  { decNr, boeNr };
        let update = { sfiNr, poNrs: "", invNrs: "", boeDate, pcs: 0, mtr: 0, totalNetWeight: 0, totalGrossWeight: 0, totalPrice: 0, summary: [] };
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