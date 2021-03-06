const express = require('express');
const router = express.Router();
const ExportItem = require('../../models/ExportItem');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;

    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'Select lines to be deleted.'});
    } else if(!req.user.isAdmin){
        return res.status(400).json({ message: 'You are not authorised to delete items.' });
    } else {
        selectedIds.map(selectedId => myPromises.push(removeItem(selectedId)));
        await Promise.all(myPromises).then(resPromises => {
            resPromises.map(resPromise => {
                if (resPromise.isRejected) {
                    nRejected++;
                } else {
                    nDeleted++;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({message: `${nDeleted} item(s) deleted, ${nRejected} item(s) rejected.`});
        });
    }
});

function removeItem(selectedId) {
    return new Promise(function(resolve) {
        ExportItem.findByIdAndDelete(selectedId, function (err) {
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