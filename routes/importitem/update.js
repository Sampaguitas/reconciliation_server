const express = require('express');
const router = express.Router();
const ImportItem = require('../../models/ImportItem');

router.put('/', (req, res) => {
    const { _id, srNr, desc, invNr, unitWeight, unitPrice, hsCode, country} = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'importitemId is required.'});
    } else {
        let filter = { _id };
        let update = { srNr, desc, invNr, unitWeight, unitPrice, hsCode, country};
        let options = { new: true };
    
        ImportItem.findOneAndUpdate(filter, update, options, function (err, importitem) {
            if (err) {
                console.log(err);
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!importitem) {
                return res.status(400).json({ message: 'Item could not be updated.'});
            } else {
                return res.status(200).json({ message: 'Item has successfully been updated.' });
            }
        });
    }
});

module.exports = router;