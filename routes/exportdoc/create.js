const express = require('express');
const router = express.Router();
const ExportDoc = require('../../models/ExportDoc');

router.post('/', (req, res) => {

    const { invNr, currency, exRate } = req.body;
    let regCurrency = /^[a-z-A-Z]{3}$/;

    if (!invNr ) {
        return res.status(400).json({ message: 'Invoice number are required.' });
    } else if (!regCurrency.test(currency)) {
        return res.status(400).json({ message: 'wrong currency format. Enter the alphabetic code as per ISO 4217.' });
    } else {
        ExportDoc.exists({ invNr }, function(errExist, resExist) {
            if (errExist) {
                return res.status(400).json({ message: 'The document could not be created.'});
            } else if (resExist) {
                return res.status(400).json({ message: 'The document already exists.'});
            } else {
                let newDocument = new ExportDoc({
                    invNr: invNr,
                    currency: currency.toUpperCase(),
                    exRate: exRate,
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