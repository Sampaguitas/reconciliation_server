const express = require('express');
const router = express.Router();
const ImportDoc = require('../../models/ImportDoc');

router.put('/', (req, res) => {
    const { _id, decNr, boeNr, boeDate } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'importdocId is required.'});
    } else {
        let filter = { _id };
        let update = { decNr, boeNr, boeDate };
        let options = { new: true };
    
        ImportDoc.findOneAndUpdate(filter, update, options, function (err, importdoc) {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!importdoc) {
                return res.status(400).json({ message: 'Item could not be updated.'});
            } else {
                return res.status(200).json({ message: 'Item has successfully been updated.' });
            }
        });
    }
});

module.exports = router;