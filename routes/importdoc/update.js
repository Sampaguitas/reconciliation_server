const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.put('/', (req, res) => {
    const { _id, decNr, boeNr, sfiNr, boeDate } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'documentId is required.'});
    } else {
        let filter = { _id };
        let update = { decNr, boeNr, sfiNr, boeDate };
        let options = { new: true };
    
        ImportDoc.findOneAndUpdate(filter, update, options, function (err, importdoc) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!importdoc) {
                return res.status(400).json({ message: 'document could not be updated.'});
            } else {
                return res.status(200).json({ message: 'document has successfully been updated.' });
            }
        });
    }
});

module.exports = router;