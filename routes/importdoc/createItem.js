const express = require('express');
const router = express.Router();
const ImportItem = require('../../models/ImportItem');

router.post('/', (req, res) => {

    const {srNr, desc, invNr, unitWeight, unitPrice, hsCode, country, documentId} = req.body;

    if (!documentId ) {
        return res.status(400).json({ message: 'documentId is required.' });
    } else {
        const newItem = new ImportItem({
            srNr: srNr,
            desc: desc,
            invNr: invNr,
            unitWeight: unitWeight,
            unitPrice: unitPrice,
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