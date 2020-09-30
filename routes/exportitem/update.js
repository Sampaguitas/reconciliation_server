const express = require('express');
const router = express.Router();
const ExportItem = require('../../models/ExportItem');

router.put('/', (req, res) => {
    const { _id, srNr, artNr, desc, poNr, pcs, mtr, totalPrice } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'itemId is missing.'});
    } else if(!req.user.isAdmin){
        return res.status(400).json({ message: 'You are not authorised to edit items.' });
    } else if (!srNr) {
        return res.status(400).json({ message: 'srNr is required.'});
    } else if (!artNr) {
        return res.status(400).json({ message: 'artNr is required.'});
    } else if (!desc) {
        return res.status(400).json({ message: 'desc is required.'});
    } else if (!poNr) {
        return res.status(400).json({ message: 'poNr is required.'});
    } else if (!pcs) {
        return res.status(400).json({ message: 'pcs is required.'});
    } else if (!totalPrice) {
        return res.status(400).json({ message: 'totalPrice is required.'});
    } else {
        let filter = { _id };
        let update = {
            srNr: srNr,
            artNr: artNr,
            desc: desc,
            poNr: poNr,
            pcs: pcs,
            mtr: mtr,
            unitPrice: totalPrice / pcs || 0,
            totalPrice: totalPrice
        };
        let options = { new: true };
    
        ExportItem.findOneAndUpdate(filter, update, options, function (err, exportitem) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!exportitem) {
                return res.status(400).json({ message: 'item could not be updated.'});
            } else {
                return res.status(200).json({ message: 'item has successfully been updated.' });
            }
        });
    }
});

module.exports = router;