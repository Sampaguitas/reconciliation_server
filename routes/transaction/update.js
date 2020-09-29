const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');

router.put('/', (req, res) => {
    const { _id, pcs, mtr  } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'transactionId is missing.'});
    } else if (!pcs){
        return res.status(400).json({ message: 'Pcs should not be empty.'});
    } else {
        let filter = { _id };
        let update = { pcs, mtr };
        let options = { new: true };
    
        Transaction.findOneAndUpdate(filter, update, options, function (err, transaction) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!transaction) {
                return res.status(400).json({ message: 'Quantities could not be updated.'});
            } else {
                return res.status(200).json({ message: 'Quantities have successfully been updated.' });
            }
        });
    }
});

module.exports = router;