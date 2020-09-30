const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.put('/', (req, res) => {
    
    if (!req.body.id) {
        return res.status(400).json({ message: 'You need to provide the user id.'});
    } else {
        let filter = { _id: req.body.id };
        let update = { userName: req.body.userName, name: req.body.name, email: req.body.email};
        let options = { new: true };
    
        User.findOneAndUpdate(filter, update, options, function (err, user) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.'});
            } else if (!user) {
                return res.status(400).json({ message: 'User could not be updated.'});
            } else {
                return res.status(200).json({ message: 'User has successfully been updated.' });
            }
        });
    }
});

module.exports = router;