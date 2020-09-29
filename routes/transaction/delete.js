const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');
const _ = require('lodash');

router.delete('/', async (req, res) => {

    const selectedIds = req.body.selectedIds;
    
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;

    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'Select lines to be deleted.'});
    } else {
        selectedIds.map(selectedId => myPromises.push(removeTransaction(selectedId)));
        await Promise.all(myPromises).then(resPromises => {
            resPromises.map(resPromise => {
                if (resPromise.isRejected) {
                    nRejected++;
                } else {
                    nDeleted++;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({message: `${nDeleted} item(s) unlinked, ${nRejected} item(s) rejected.`});
        });
    }
});

function removeTransaction(selectedId) {
    return new Promise(function(resolve) {
        Transaction.findByIdAndDelete(selectedId, function (err) {
            if (err) {
                resolve({
                    isRejected: true
                });
            } else {
                resolve({
                    isRejected: false
                });
            }
        });
    });
}

module.exports = router;