const express = require('express');
const router = express.Router();
const ImportItem = require('../../models/ImportItem');

router.put('/', (req, res) => {
    const { _id, srNr, invNr, poNr, artNr, desc, pcs, mtr, totalNetWeight, totalGrossWeight, totalPrice, hsCode, hsDesc, country } = req.body;
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
            invNr: invNr,
            poNr: poNr,
            artNr: artNr,
            desc: desc,
            pcs: pcs,
            mtr: mtr,
            unitNetWeight: totalNetWeight / pcs || 0,
            totalNetWeight: totalNetWeight,
            unitGrossWeight: totalGrossWeight / pcs || 0,
            totalGrossWeight: totalGrossWeight,
            unitPrice: totalPrice / pcs || 0,
            totalPrice: totalPrice,
            hsCode: hsCode,
            hsDesc: hsDesc,
            country: country
        };
        let options = { new: true };
    
        ImportItem.findOneAndUpdate(filter, update, options, function (err, importitem) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!importitem) {
                return res.status(400).json({ message: 'item could not be updated.'});
            } else {
                return res.status(200).json({ message: 'item has successfully been updated.' });
            }
        });
    }
});

module.exports = router;