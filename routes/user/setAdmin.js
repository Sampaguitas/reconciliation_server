const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.put('/', (req, res) => {
    User.findOne({ id: req.user._id, isAdmin:1 }, function(errAuth, resAuth) {
        if (errAuth) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!resAuth) {
            return res.status(400).json({ message: 'Unauthorized.' });
        } else {
            User.findByIdAndUpdate(req.query.id, { $set: { isAdmin: req.body.isAdmin } }, function(errSet, resSet) {
                if (errSet || !resSet) {
                    return res.status(400).json({ message: 'Could not update role.' });
                } else {
                    return res.status(200).json({ message: 'User has successfully been updated.' });
                }
            });
        }
    });
});

module.exports = router;