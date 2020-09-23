const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    
    const transactionId = req.body.transactionId;

    if (_.isEmpty(transactionId)) {
        return res.status(400).json({message: 'transactionId is missing.'});
    } else if(!req.user.isAdmin){
        return res.status(400).json({ message: 'You are not authorised to delete transactions.' });
    } else {
        Transaction.findByIdAndDelete(transactionId, function (err, doc) {
            if (!!err) {
                return res.status(400).json({message: 'An error has occured.'});
            } else if (!doc) {
                return res.status(400).json({message: 'transaction could not be deleted.'});
            } else {
                return res.status(400).json({message: 'transaction has successfully been deleted.'});
            }
        });
    }
});

module.exports = router;