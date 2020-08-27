const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const _ = require('lodash');

router.put('/', (req, res) => {
    if (_.isEqual(String(req.user._id), req.body.id)) {
        return res.status(400).json({ message: 'You cannot change your own role.' });
    } else if(!req.user.isAdmin){
        return res.status(400).json({ message: 'You are not authorised to change this role.' });
    } else {
        User.findByIdAndUpdate(req.body.id, {isAdmin: req.body.isAdmin}, function(errSet, resSet) {
            if (errSet || !resSet) {
                return res.status(400).json({ message: 'Could not update role.' });
            } else {
                return res.status(200).json({ message: 'User role has successfully been updated.' });
            }
        });
    }
    
});

module.exports = router;