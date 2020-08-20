const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.delete('/', (req, res) => {
    const id = req.query.id;
    User.findByIdAndDelete(id, function (err, user) {
        if (err || !user) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else {
            return res.status(200).json({ message: 'User has successfully been deleted.'});
        }
    });
});

module.exports = router;