const express = require('express');
const router = express.Router();
const ImportItem = require('../../models/ImportItem');

router.post('/', (req, res) => {

    const {srNr, qty, desc, poNr, invNr, totWeight, totPrice, hsCode, country, documentId} = req.body;

    if (!documentId ) {
        return res.status(400).json({ message: 'documentId is required.' });
    } else {
        const newItem = new ImportItem({
            srNr: srNr,
            qty: qty,
            desc: desc,
            poNr: poNr,
            invNr: invNr,
            unitWeight: totWeight / qty || 0,
            totWeight: totWeight,
            unitPrice:  totPrice / qty || 0,
            totPrice: totPrice,
            hsCode: hsCode,
            country: country,
            documentId: documentId
        });
        newItem.save()
        .then( () => res.status(200).json({ message: 'Item successfully created.'}))
        .catch( () => res.status(400).json({ message: 'Item could not be created.' }));
    }
});

module.exports = router;