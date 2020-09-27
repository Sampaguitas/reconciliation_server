const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.post('/', (req, res) => {

    const { decNr, boeNr, sfiNr, boeDate } = req.body;
    let regDec = /^\d{3}-\d{8}-\d{2}$/;
    let regBoe = /^\d{12}$/;
    
    if (!decNr || !boeNr || !sfiNr || !boeDate) {
        return res.status(400).json({ message: 'DEC, BOE, SFI and Date are required.'});
    } else if (!regDec.test(decNr)) {
        return res.status(400).json({ message: 'Wrong DEC format.'});
    } else if (!regBoe.test(boeNr)) {
        return res.status(400).json({ message: 'Wrong BOE format.'});
    } else {
        ImportDoc.exists({ decNr, boeNr }, function(errExist, resExist) {
            if (errExist) {
                return res.status(400).json({ message: 'The document could not be created.'});
            } else if (resExist) {
                return res.status(400).json({ message: 'The document already exists.'});
            } else {
                let newDocument = new ImportDoc({
                    decNr: decNr,
                    boeNr: boeNr,
                    sfiNr: sfiNr,
                    poNrs: "",
                    invNrs: "",
                    boeDate: boeDate,
                    pcs: 0,
                    mtr: 0,
                    totalNetWeight: 0,
                    totalGrossWeight: 0,
                    totalPrice: 0,
                    summary: [],
                    assignedPcs: 0,
                    assigendMtr: 0,
                    isClosed: false,
                });

                newDocument.save()
                .then( () => res.status(200).json({message: 'The document whas successfuly created.'}))
                .catch( () => res.status(400).json({ message: 'The document could not be created.' }));
            }
        });
    }
});

module.exports = router;