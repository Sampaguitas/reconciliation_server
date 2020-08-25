const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const _ = require('lodash');

router.put('/', (req, res) => {
    if (_.isEqual(String(req.user._id), req.body.id)) {
        return res.status(400).json({ message: 'You are not allowed to change your won role.' });
    } else {
        User.findOne({ _id: req.user._id, isAdmin: true }, function(errAuth, resAuth) {
            if (errAuth) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else if (!resAuth) {
                return res.status(400).json({ message: 'Unauthorized.' });
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
    }
    
});

module.exports = router;