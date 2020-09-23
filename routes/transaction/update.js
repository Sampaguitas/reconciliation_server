const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');

router.put('/', (req, res) => {
    const { _id, fieldValue, fieldName  } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'documentId is required.'});
    } else {
        let filter = { _id };
        let update = { [`${fieldValue}`]: fieldName };
        let options = { new: true };
    
        Transaction.findOneAndUpdate(filter, update, options, function (err, exportDoc) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!exportDoc) {
                return res.status(400).json({ message: 'transaction could not be updated.'});
            } else {
                return res.status(200).json({ message: 'transaction has successfully been updated.' });
            }
        });
    }
});

module.exports = router;