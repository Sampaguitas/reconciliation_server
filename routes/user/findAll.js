const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    User.find(data).sort({name: 'asc'})
    .exec(function (err, user) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!user) {
            return res.status(400).json({ message: 'No user could be retrived.' });
        } else {
            return res.json(user);
        }
    });
});

module.exports = router;