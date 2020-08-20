const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.get('/', (req, res) => {
    const id = req.query.id
    User.findById(id).populate('opco', 'name')
    .exec(function (err, user) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'})
        } if (!user) {
            return res.status(400).json({ message: 'User does not exist.' });
        } else {
            return res.json(user);
        }
    });
});

module.exports = router;
