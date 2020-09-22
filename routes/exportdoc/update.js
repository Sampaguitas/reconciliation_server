const express = require('express');
const router = express.Router();
const ExportDoc = require('../../models/ExportDoc');

router.put('/', (req, res) => {
    const { _id, invNr, currency, exRate, decNr, boeNr, boeDate  } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'documentId is required.'});
    } else {
        let filter = { _id };
        let update = { invNr, currency, exRate, decNr, boeNr, boeDate };
        let options = { new: true };
    
        ExportDoc.findOneAndUpdate(filter, update, options, function (err, exportDoc) {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!exportDoc) {
                return res.status(400).json({ message: 'document could not be updated.'});
            } else {
                return res.status(200).json({ message: 'document has successfully been updated.' });
            }
        });
    }
});

module.exports = router;